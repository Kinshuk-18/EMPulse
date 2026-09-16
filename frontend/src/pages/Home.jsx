import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// Centralized API URL — all pages pull from here so we never drift again
import { BASE_URL } from '../config';
import {
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Building2,
  MapPin,
  Users,
  ArrowRight,
  Lock,
  Mail,
  Key,
  Clock,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Hackathon dev note: Replaced old Login.jsx with this official-looking Govt Portal Home page.
// Added Team Vikings attribution block!
export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Quick 1-click helper for judges so they can switch roles in 2 seconds without typing
  const fillCredentials = (email, pass) => {
    setUsername(email);
    setPassword(pass);
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Quick 3-tier auth request to FastAPI backend — using centralized BASE_URL from config
    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Clean professional error message for presentation
        throw new Error(errData.detail || 'Invalid email or password. Please verify your credentials and try again.');
      }

      const data = await res.json();

      // Store user, role, scope, and token in AuthContext
      login(data);

      // On successful login, redirect user strictly to /dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Connecting to secure government servers... Please click Sign In again if it persists.');
      } else {
        setError(err.message || 'Invalid credentials. Please verify and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-[#6c5ce7] selection:text-white">
      {/* Official Government Header Top Bar */}
      <header className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded text-[11px] border border-amber-500/30 uppercase tracking-wider">
              GOVT SCHEME PORTAL
            </span>
            <span className="text-slate-300 font-medium hidden md:inline">
              National Vocational Skilling & Impact Measurement Portal
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Official Outcome Audit System</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              API v1.0 Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container: Split 60% / 40% */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch">

        {/* Left Side: Official Scheme Details & Milestones (60% Width) */}
        <section className="w-full lg:w-[60%] flex flex-col justify-between space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-6">

            {/* National Emblem / Badge & Scheme Banner */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#6c5ce7] to-indigo-600 flex items-center justify-center shadow-lg shadow-[#6c5ce7]/20 flex-shrink-0 text-white">
                <ShieldCheck size={32} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6c5ce7] uppercase tracking-wider">
                  <Building2 size={14} /> National Vocational Skilling Framework
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  EMPulse <span className="text-[#6c5ce7]">System</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Longitudinal Skilling & Impact Measurement Portal
                </p>
              </div>
            </div>

            {/* Scheme Objectives Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-[#6c5ce7]" /> Program Overview & Objectives
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                EMPulse standardizes longitudinal tracking for ITI and PMKVY graduates across 3, 6, and 12-month post-completion milestones. By integrating automated multi-channel verification, the system replaces manual surveys with real-time wage and retention proof.
              </p>
            </div>

            {/* Core Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-[#6c5ce7] mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Verified Placement Audit</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Automated cross-check of EPFO records and employer declarations.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Longitudinal Analytics</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Multi-tier RBAC reporting across National, Regional, and Center tiers.</p>
                </div>
              </div>
            </div>

            {/* Tracking Milestones Display (3, 6, 12 Months) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={14} className="text-[#6c5ce7]" /> Mandatory Tracking Milestones
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
                  <div className="text-lg font-black text-[#6c5ce7]">3 Months</div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Initial Outcome</div>
                  <div className="text-[10px] text-slate-500 mt-1">First Job Joining & Wage Check</div>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                  <div className="text-lg font-black text-purple-700">6 Months</div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Mid-term Audit</div>
                  <div className="text-[10px] text-slate-500 mt-1">Job Stability & Promotion Audit</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="text-lg font-black text-emerald-700">12 Months</div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Retention Milestone</div>
                  <div className="text-[10px] text-slate-500 mt-1">Annual Impact & Wage Growth</div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><Award size={14} /> Official Government Scheme Portal</span>
            <span>Portal Architecture</span>
          </div>
        </section>

        {/* Right Side: Fixed Clean Login Panel (40% Width) */}
        <section className="w-full lg:w-[40%] bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">

            {/* Panel Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-[#6c5ce7] mb-2">
                <Lock size={12} /> Authorized Access Only
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Portal Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your official credentials to access your designated role dashboard.
              </p>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign In Form (Sign In Only - No Sign Up as specified) */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@empulse.gov.in"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Login Button with #6c5ce7 accent */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6c5ce7] hover:bg-[#5b4be2] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md shadow-[#6c5ce7]/20 hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Quick Fill Cards for Hackathon Judges */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
                Judges Quick Demo Credentials (1-Click Fill)
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@empulse.gov.in', 'admin123')}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users size={12} className="text-[#6c5ce7]" /> Admin (Global Access)
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">admin@empulse.gov.in</div>
                  </div>
                  <span className="text-[10px] font-semibold bg-[#6c5ce7]/10 text-[#6c5ce7] px-2 py-0.5 rounded group-hover:bg-[#6c5ce7] group-hover:text-white transition">
                    Fill Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('pune.nodal@empulse.gov.in', 'nodal123')}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin size={12} className="text-purple-600" /> Pune Nodal Officer
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">pune.nodal@empulse.gov.in</div>
                  </div>
                  <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded group-hover:bg-purple-600 group-hover:text-white transition">
                    Fill Nodal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('pune.iti@empulse.gov.in', 'inst123')}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 size={12} className="text-emerald-600" /> Government ITI Aundh (Pune)
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">pune.iti@empulse.gov.in</div>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded group-hover:bg-emerald-600 group-hover:text-white transition">
                    Fill Institute
                  </span>
                </button>
              </div>
            </div>

          </div>

          <div className="mt-6 text-center text-[11px] text-slate-400">
            For support, contact support@empulse.com
          </div>
        </section>

      </main>

      {/* Team Vikings Attribution Card */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Team Vikings credits footer */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6c5ce7]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6c5ce7]/20 border border-[#6c5ce7]/30 text-xs font-bold text-indigo-300 mb-2">
                <Sparkles size={12} className="text-[#a29bfe]" /> Official Government Portal Prototype
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Engineered by Team Vikings
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Empowering national vocational governance through verifiable longitudinal skilling analytics.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700/80 whitespace-nowrap self-start md:self-auto">
              <span>Team Code: Vikings</span>
            </div>
          </div>

          {/* Team Members Grid */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Users size={14} className="text-[#6c5ce7]" /> Core Development Team
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6c5ce7] text-white flex items-center justify-center font-bold text-xs shadow-md">
                  KS
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Kinshuk Sen
                    <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                      Team Lead
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Team Lead</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  DC
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Divyansh Choudhary</div>
                  <div className="text-[11px] text-slate-400">Team Member</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  MR
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Manya Rawat</div>
                  <div className="text-[11px] text-slate-400">Team Member</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  SS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Siddhant Singh Parihar</div>
                  <div className="text-[11px] text-slate-400">Team Member</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  PP
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Piyush Pratap Singh Rajpoot</div>
                  <div className="text-[11px] text-slate-400">Team Member</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                  PA
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Pradeep Ahirwar</div>
                  <div className="text-[11px] text-slate-400">Team Member</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-4 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 EMPulse System — Ministry of Skill Development & Entrepreneurship</span>
          <span>Portal Edition</span>
        </div>
      </footer>
    </div>
  );
}
