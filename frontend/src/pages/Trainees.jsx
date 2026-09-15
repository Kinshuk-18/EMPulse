import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Trainees() {
    const { role, scope, district, instituteName } = useContext(AuthContext);

    // Grabbing the trainee records from FastAPI with 3-tier RBAC filtering
    const [trainees, setTrainees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal control state
    const [isOpen, setIsOpen] = useState(false);

    // Form fields for a new trainee
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        aadhaar_last_four: '',
        institute_name: instituteName || (role === 'institute' ? 'Government ITI Bhopal' : 'Government ITI Bhopal'),
        course_name: '',
        current_status: 'Searching',
        district: district || (role === 'nodal' ? 'Bhopal' : 'Bhopal'),
        graduation_date: new Date().toISOString().split('T')[0]
    });

    // Fetch data on page load & when role/scope changes
    useEffect(() => {
        fetchTrainees();
    }, [role, scope, district, instituteName]);

    const fetchTrainees = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (role) params.append("role", role);
            if (scope) params.append("scope", scope);
            if (district) params.append("district", district);
            if (instituteName) params.append("institute_name", instituteName);

            let res;
            try {
                res = await fetch(`http://127.0.0.1:8000/api/trainees?${params.toString()}`);
            } catch (err) {
                res = await fetch(`http://localhost:8000/api/trainees?${params.toString()}`);
            }

            if (!res.ok) throw new Error('Failed to fetch trainees from backend');
            const data = await res.json();
            setTrainees(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Submit new trainee to backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Format graduation date to ISO string if needed by backend model
            const payload = {
                ...formData,
                graduation_date: new Date(formData.graduation_date).toISOString()
            };

            let res;
            try {
                res = await fetch('http://127.0.0.1:8000/api/trainees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } catch (err) {
                res = await fetch('http://localhost:8000/api/trainees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.detail || 'Could not register trainee');
            }

            await fetchTrainees();
            setIsOpen(false);
            setFormData({
                name: '',
                phone: '',
                aadhaar_last_four: '',
                institute_name: instituteName || 'Government ITI Bhopal',
                course_name: '',
                current_status: 'Searching',
                district: district || 'Bhopal',
                graduation_date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Banner Card matching Dashboard styling */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Trainee Database</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Central repository for longitudinal tracking • Filtered Scope: <span className="font-semibold text-[#6c5ce7]">{scope || 'Global'}</span>
                    </p>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#6c5ce7] hover:bg-[#5b4be2] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#6c5ce7]/20 transition-all cursor-pointer whitespace-nowrap"
                >
                    + Add New Trainee
                </button>
            </div>

            {/* Loading & Error States */}
            {loading && (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-xs text-gray-400 shadow-sm font-medium">
                    Syncing scoped records with database...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs shadow-sm">
                    ⚠️ Connection error: {error}. Make sure Uvicorn is running.
                </div>
            )}

            {/* Main Data Table Card */}
            {!loading && !error && (
                <div className="w-full bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-4 px-6">Trainee Name</th>
                                    <th className="py-4 px-6">Phone Number</th>
                                    <th className="py-4 px-6">Institute</th>
                                    <th className="py-4 px-6">Course / Trade</th>
                                    <th className="py-4 px-6">District</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {trainees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-400">
                                            No trainee records found for this scope ({scope || 'Global'}). Click "Add New Trainee" above to register one.
                                        </td>
                                    </tr>
                                ) : (
                                    trainees.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-gray-900">{t.name}</td>
                                            <td className="py-4 px-6 text-gray-600 font-mono text-xs">{t.phone}</td>
                                            <td className="py-4 px-6 text-gray-600">{t.institute_name}</td>
                                            <td className="py-4 px-6 text-gray-600">{t.course_name}</td>
                                            <td className="py-4 px-6 text-gray-600">{t.district}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    t.current_status === 'Employed' || t.current_status === 'Self-Employed'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                    {t.current_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modern Centered Registration Modal */}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Register New Trainee</h2>
                            <p className="text-xs text-gray-500 mt-1">Enter candidate details for outcome tracking.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                                <input type="text" name="name" placeholder="e.g. Priya Sharma" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                                    <input type="text" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white" />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Aadhaar (Last 4)</label>
                                    <input type="text" name="aadhaar_last_four" placeholder="1234" maxLength="4" value={formData.aadhaar_last_four} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Institute Name</label>
                                <input type="text" name="institute_name" placeholder="Government ITI Bhopal" value={formData.institute_name} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Course Name</label>
                                    <input type="text" name="course_name" placeholder="Electrician" value={formData.course_name} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white" />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">District</label>
                                    <input type="text" name="district" placeholder="Bhopal" value={formData.district} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Current Status</label>
                                <select name="current_status" value={formData.current_status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white">
                                    <option value="Searching">Searching</option>
                                    <option value="Employed">Employed</option>
                                    <option value="Self-Employed">Self-Employed</option>
                                    <option value="Unemployed">Unemployed</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#5b4be2] transition cursor-pointer">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}