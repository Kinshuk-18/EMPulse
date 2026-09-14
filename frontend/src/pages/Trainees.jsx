import { useState, useEffect } from 'react';

export default function Trainees() {
    // Grabbing the trainee records from FastAPI, keeping it smooth for the demo
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
        institute_name: '',
        course_name: '',
        current_status: 'Enrolled',
        district: ''
    });

    // Fetch data on page load
    useEffect(() => {
        fetchTrainees();
    }, []);

    const fetchTrainees = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://127.0.0.1:8000/api/trainees');
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
            const res = await fetch('http://127.0.0.1:8000/api/trainees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Could not register trainee');

            await fetchTrainees();
            setIsOpen(false);
            setFormData({
                name: '',
                phone: '',
                aadhaar_last_four: '',
                institute_name: '',
                course_name: '',
                current_status: 'Enrolled',
                district: ''
            });
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Banner Card matching Dashboard styling */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Trainee Database</h1>
                    <p className="text-sm text-slate-500 mt-1">Central repository for tracking skilling outcomes and employment status for SIH 2026.</p>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#6c5ce7] hover:bg-[#5b4be2] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                    + Add New Trainee
                </button>
            </div>

            {/* Loading & Error States */}
            {loading && (
                <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-500">
                    Syncing records with database...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                    ⚠️ Connection error: {error}. Make sure Uvicorn is running.
                </div>
            )}

            {/* Main Data Table Card */}
            {!loading && !error && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-4 px-6">Trainee Name</th>
                                    <th className="py-4 px-6">Phone Number</th>
                                    <th className="py-4 px-6">Institute</th>
                                    <th className="py-4 px-6">Course / Trade</th>
                                    <th className="py-4 px-6">District</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {trainees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            No trainee records found. Click &quot;Add New Trainee&quot; above to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    trainees.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-slate-900">{t.name}</td>
                                            <td className="py-4 px-6 text-slate-600 font-mono text-xs">{t.phone}</td>
                                            <td className="py-4 px-6 text-slate-600">{t.institute_name}</td>
                                            <td className="py-4 px-6 text-slate-600">{t.course_name}</td>
                                            <td className="py-4 px-6 text-slate-600">{t.district}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${t.current_status === 'Employed'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
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

            {/* Modern Centered Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Register New Trainee</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Enter candidate details for SIH outcome tracking.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                                <input type="text" name="name" placeholder="e.g. Priya Sharma" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-[#6c5ce7]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                                    <input type="text" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-[#6c5ce7]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Aadhaar (Last 4)</label>
                                    <input type="text" name="aadhaar_last_four" placeholder="1234" maxLength="4" value={formData.aadhaar_last_four} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-[#6c5ce7]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Institute Name</label>
                                <input type="text" name="institute_name" placeholder="Government ITI Bhopal" value={formData.institute_name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-[#6c5ce7]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Course Name</label>
                                    <input type="text" name="course_name" placeholder="Electrician" value={formData.course_name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-[#6c5ce7]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
                                    <input type="text" name="district" placeholder="Bhopal" value={formData.district} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-[#6c5ce7]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Current Status</label>
                                <select name="current_status" value={formData.current_status} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-[#6c5ce7]">
                                    <option value="Enrolled">Enrolled</option>
                                    <option value="Employed">Employed</option>
                                    <option value="Seeking">Seeking</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#6c5ce7] text-white rounded-xl text-sm font-semibold shadow-xs hover:opacity-90 transition cursor-pointer">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}