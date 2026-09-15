import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Headphones,
  Mail,
  Phone,
  Building2,
  Send,
  CheckCircle2,
  MessageSquare,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

// Built the Nodal Helpdesk & Support page.
// Handles direct support inquiries for Admin, Nodal Officers, and ITI Institutes!
export default function Contact() {
  const { user, role, scope } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    fullName: user ? (role === 'admin' ? 'System Administrator' : role === 'nodal' ? 'District Nodal Officer' : 'Institute Administrator') : '',
    email: user || 'officer@empulse.com',
    roleScope: scope || (role ? `${role.toUpperCase()} Scope` : 'Global Access'),
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulated ticket dispatch for demo presentation
    setTimeout(() => {
      const randomTicket = `EM-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(randomTicket);
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setTicketId(null);
    setFormData({
      fullName: user ? (role === 'admin' ? 'System Administrator' : role === 'nodal' ? 'District Nodal Officer' : 'Institute Administrator') : '',
      email: user || 'officer@empulse.com',
      roleScope: scope || 'Global Access',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-[#6c5ce7] mb-2">
            <Headphones size={14} /> Official Support Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Helpdesk & Nodal Technical Support
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Dedicated assistance for Regional Nodal Officers, ITI Principals, and National System Administrators.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#6c5ce7] bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-100 self-start md:self-auto">
          <ShieldCheck size={16} />
          <span>Nodal Response Cell</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Official Contact Info Cards (1 Column) */}
        <div className="space-y-4">
          
          {/* Official Email */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#6c5ce7] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Official Support Email</h3>
              <p className="text-sm font-bold text-gray-900 mt-0.5 font-mono select-all">support@empulse.com</p>
              <p className="text-[11px] text-gray-400 mt-1">Expected response within 24 business hours.</p>
            </div>
          </div>

          {/* Helpline Contact */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Phone size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Helpline Contact</h3>
              <p className="text-sm font-bold text-gray-900 mt-0.5 font-mono">+91 99072 70088</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                <Clock size={12} /> Mon-Sat, 9:00 AM - 6:00 PM IST
              </div>
            </div>
          </div>

          {/* Office Address Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Head Operations Cell</h3>
              <p className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">
                Skill Impact Operations Cell, Ministry of Skill Development & Entrepreneurship
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Shram Shakti Bhawan, Rafi Marg, New Delhi 110001</p>
            </div>
          </div>

          {/* Team Vikings Branding Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Sparkles size={14} className="text-[#a29bfe]" /> Team Vikings Engineering
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Facing issue with longitudinal verification or EPFO API integration? Submit a ticket for rapid resolution.
            </p>
          </div>

        </div>

        {/* Right Column: Query Form (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
          
          {submitted ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Support Ticket Created!</h2>
              <div className="inline-block bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-sm font-mono font-bold text-[#6c5ce7]">
                Ticket ID: {ticketId}
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Thank you for contacting technical support. A confirmation has been routed to <span className="font-semibold text-gray-800">{formData.email}</span>. Our Nodal Support Cell will inspect your query shortly.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-[#6c5ce7] hover:bg-[#5b4be2] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Submit Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <MessageSquare size={20} className="text-[#6c5ce7]" />
                <div>
                  <h2 className="text-base font-bold text-gray-900">Submit Technical Support Ticket</h2>
                  <p className="text-xs text-gray-400">Fill out candidate or portal operational issues for instant tracking.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Kinshuk Sen"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Registered Email / ID
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="support@empulse.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Role / Institute Name
                  </label>
                  <input
                    type="text"
                    name="roleScope"
                    value={formData.roleScope}
                    onChange={handleInputChange}
                    placeholder="e.g. Government ITI Bhopal"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Query Category / Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white transition-all"
                  >
                    <option value="">Select Query Category</option>
                    <option value="Longitudinal Check-in Issue">Longitudinal 3/6/12 Month Check-in Issue</option>
                    <option value="Trainee Registration Discrepancy">Trainee Registration Discrepancy</option>
                    <option value="RBAC Access / Scope Change">RBAC Access / Scope Permission Change</option>
                    <option value="EPFO Verification API Sync">EPFO Verification API Sync Failure</option>
                    <option value="Other Technical Support">Other Technical Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Query Details
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your operational issue or technical discrepancy in detail..."
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#6c5ce7] hover:bg-[#5b4be2] text-white rounded-xl font-bold text-xs shadow-md shadow-[#6c5ce7]/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Generating Ticket...</span>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
