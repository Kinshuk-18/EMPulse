import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Trash2,
  Eye,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Hash,
  User,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { maskPhone, maskEmail } from '../utils/masking';
// Centralized API URL — wired to the live Render backend for all institute CRUD ops
import { BASE_URL } from '../config';

function DetailRow({ icon: Icon, label, value, sensitive }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-[#6c5ce7]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-[#6c5ce7]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 ${sensitive ? 'text-red-700 font-mono' : 'text-gray-900'}`}>
          {value || '—'}
        </p>
        {sensitive && (
          <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
            <ShieldAlert size={9} /> Sensitive — restricted view
          </p>
        )}
      </div>
    </div>
  );
}

const EMPTY_FORM = { name: '', district: '', principal_name: '', phone: '', email: '', dise_code: '' };

export default function Institutes() {
  const { role } = useContext(AuthContext);

  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);

  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInstitutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/institutes`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      setInstitutes(await res.json());
    } catch {
      setError('Could not load Institutes. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInstitutes(); }, []);

  // Real-time search filter — name, district, DISE code
  const filtered = institutes.filter((i) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      i.name.toLowerCase().includes(q) ||
      i.district.toLowerCase().includes(q) ||
      i.dise_code.toLowerCase().includes(q) ||
      i.principal_name.toLowerCase().includes(q)
    );
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/institutes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to add institute');
      }
      await fetchInstitutes();
      setIsAddOpen(false);
      setFormData(EMPTY_FORM);
      showToast('Training Institute registered successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this Training Institute from the system?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${BASE_URL}/api/institutes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Delete failed');
      }
      setInstitutes((prev) => prev.filter((i) => i.id !== id));
      setSelected(null);
      showToast('Institute removed successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-[#6c5ce7] mb-2">
            <Building2 size={14} /> Institutes Management
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Training Institutes Registry</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage registered ITIs and skill training centres across the national network.
          </p>
        </div>
        <button
          id="institute-add-btn"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6c5ce7] hover:bg-[#5b4be2] text-white rounded-xl text-xs font-bold shadow-md shadow-[#6c5ce7]/20 transition cursor-pointer whitespace-nowrap"
        >
          <Plus size={14} /> Add Institute
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border ${
          toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input
          id="institute-search"
          type="text"
          placeholder="Search by name, district, DISE code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:border-[#6c5ce7] transition shadow-sm"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">
            <RefreshCw size={16} className="animate-spin text-[#6c5ce7]" />
            Loading Institutes...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Institute Name</th>
                  <th className="py-4 px-6">District</th>
                  <th className="py-4 px-6">DISE Code</th>
                  <th className="py-4 px-6">Principal</th>
                  <th className="py-4 px-6">Phone (Masked)</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400">
                      {searchQuery ? `No institutes match "${searchQuery}".` : 'No institutes registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((inst) => (
                    <tr key={inst.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">{inst.name}</td>
                      <td className="py-4 px-6 text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} className="text-[#6c5ce7]" />
                          {inst.district}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-500">{inst.dise_code}</td>
                      <td className="py-4 px-6 text-gray-600">{inst.principal_name}</td>
                      {/* Phone masked by default in overview */}
                      <td className="py-4 px-6 font-mono text-gray-500">{maskPhone(inst.phone)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {inst.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          id={`inst-view-${inst.id}`}
                          onClick={() => setSelected(inst)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#6c5ce7] text-xs font-semibold transition cursor-pointer border border-indigo-100"
                        >
                          <Eye size={12} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {filtered.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400 flex items-center justify-between">
                <span>{filtered.length} institute{filtered.length !== 1 ? 's' : ''} found</span>
                <span className="text-[10px] font-mono text-gray-300">Phone masked • Click 👁️ to reveal</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── View Details Modal ─────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#6c5ce7]/8 to-indigo-50/60 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-[#6c5ce7] uppercase tracking-widest mb-0.5">
                  Institute Profile
                </p>
                <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">ID #{selected.id} • Unmasked PII View</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4">
              <DetailRow icon={Phone} label="Phone Number"     value={selected.phone}          sensitive />
              <DetailRow icon={Mail}  label="Email Address"    value={selected.email}          sensitive />
              <DetailRow icon={MapPin} label="District"        value={selected.district} />
              <DetailRow icon={User}  label="Principal Name"   value={selected.principal_name} />
              <DetailRow icon={Hash}  label="DISE Code"        value={selected.dise_code} />
              <div className="flex items-start gap-3 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#6c5ce7]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={14} className="text-[#6c5ce7]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                  <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
                Close
              </button>
              {role === 'admin' && (
                <button
                  id={`inst-modal-delete-${selected.id}`}
                  onClick={() => handleDelete(selected.id)}
                  disabled={deletingId === selected.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-red-600/20"
                >
                  <Trash2 size={13} />
                  {deletingId === selected.id ? 'Removing…' : 'Delete Record'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Institute Modal ────────────────────────────────────── */}
      {isAddOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddOpen(false); }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Register Training Institute</h3>
                <p className="text-xs text-gray-500 mt-0.5">Add a new ITI or skill centre to the network.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'name',           label: 'Institute Name',   placeholder: 'Government ITI Bhopal',    full: true },
                  { name: 'district',       label: 'District',         placeholder: 'e.g. Bhopal' },
                  { name: 'principal_name', label: 'Principal Name',   placeholder: 'Dr. Anil Shrivastava' },
                  { name: 'dise_code',      label: 'DISE Code',        placeholder: 'MP-BPL-0012' },
                  { name: 'phone',          label: 'Phone Number',     placeholder: '9876543210' },
                  { name: 'email',          label: 'Email Address',    placeholder: 'iti@empulse' },
                ].map((field) => (
                  <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                    <label className="block font-bold text-gray-700 mb-1">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:bg-white focus:border-[#6c5ce7] transition"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading} className="px-4 py-2 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#5b4be2] cursor-pointer disabled:opacity-60">
                  {addLoading ? 'Saving…' : 'Register Institute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
