import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Users,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MapPin,
  Building2,
  ShieldCheck,
  Award
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

// Reusable Metric Card component
function MetricCard({ metric }) {
  const Icon = metric.icon;
  const isUp = metric.trend === "up";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{metric.label}</p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: metric.iconBg }}
        >
          <Icon size={20} style={{ color: metric.iconColor }} />
        </div>
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">
          {metric.value}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          }`}
        >
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {metric.change}
        </span>
        <span className="text-xs text-gray-400">{metric.description}</span>
      </div>
    </div>
  );
}

// Simple loading spinner
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <RefreshCw
        size={28}
        className="animate-spin text-[#6c5ce7]"
      />
      <span className="ml-3 text-sm text-gray-400 font-medium">Fetching scoped data from backend...</span>
    </div>
  );
}

export default function Dashboard() {
  const { role, scope, district, instituteName } = useContext(AuthContext);

  const [trainees, setTrainees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Hackathon dev comment: Filtering metrics dynamically based on RBAC scope returned by backend!
  const fetchTrainees = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string based on role and scope
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (scope) params.append("scope", scope);
      if (district) params.append("district", district);
      if (instituteName) params.append("institute_name", instituteName);

      const url = `${API_BASE}/api/trainees?${params.toString()}`;
      
      let res;
      try {
        res = await fetch(url);
      } catch (err) {
        // Fallback to localhost if 127.0.0.1 binding is stubborn
        res = await fetch(`http://localhost:8000/api/trainees?${params.toString()}`);
      }

      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setTrainees(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Could not reach backend API at http://127.0.0.1:8000. Is uvicorn main:app --reload running?");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, [role, scope, district, instituteName]);

  // Hackathon dev comment: Dynamic title greeting depending strictly on user's role!
  let titleGreeting = "National Skilling Overview";
  let scopeBadge = "Global Scope";
  let ScopeIcon = ShieldCheck;

  if (role === "nodal") {
    titleGreeting = "Bhopal Region Dashboard";
    scopeBadge = "District: Bhopal";
    ScopeIcon = MapPin;
  } else if (role === "institute") {
    titleGreeting = "Govt ITI Bhopal Center";
    scopeBadge = "Institute: Government ITI Bhopal";
    ScopeIcon = Building2;
  } else if (role === "admin") {
    titleGreeting = "National Skilling Overview";
    scopeBadge = "National Scope (Global)";
    ScopeIcon = ShieldCheck;
  }

  // Calculate metrics dynamically ONLY from filtered trainee list returned by backend
  const total = trainees?.length ?? 0;
  const employed = trainees?.filter(
    (t) => t.current_status === "Employed" || t.current_status === "Self-Employed"
  ).length ?? 0;
  const rate = total > 0 ? ((employed / total) * 100).toFixed(1) : "0.0";

  const metrics = [
    {
      id: "total-trainees",
      label: "Total Trainees",
      value: loading ? "—" : total.toLocaleString(),
      change: "+live",
      trend: "up",
      description: role === "admin" ? "in national database" : `scoped to ${scope || 'role'}`,
      icon: Users,
      iconBg: "#EEF2FF",
      iconColor: "#6C5CE7",
    },
    {
      id: "verified-employed",
      label: "Verified Employed",
      value: loading ? "—" : employed.toLocaleString(),
      change: "+live",
      trend: "up",
      description: "Employed + Self-Employed",
      icon: Briefcase,
      iconBg: "#F0FFF4",
      iconColor: "#22C55E",
    },
    {
      id: "placement-rate",
      label: "Placement Rate",
      value: loading ? "—" : `${rate}%`,
      change: parseFloat(rate) >= 50 ? "On target" : "Below target",
      trend: parseFloat(rate) >= 50 ? "up" : "down",
      description: "of scoped candidates",
      icon: TrendingUp,
      iconBg: "#FFF7ED",
      iconColor: "#F97316",
    },
  ];

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-xs font-semibold text-[#6c5ce7] mb-2 border border-indigo-100">
            <ScopeIcon size={14} />
            <span>{scopeBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {titleGreeting}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time longitudinal outcome tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTrainees}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#6c5ce7]" : ""} />
            <span>Refresh Data</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {formattedTime ? `Updated ${formattedTime}` : "Connecting..."}
          </div>
        </div>
      </div>

      {/* Backend error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 shadow-sm">
          <span className="text-lg leading-none">⚠️</span>
          <div>
            <p className="font-bold">Backend Unreachable</p>
            <p className="mt-0.5 text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Dynamic Key Metric Cards */}
      <section>
        <h2 className="sr-only">Key Metrics</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        )}
      </section>

      {/* Scoped Trainee Preview Table / Summary */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Scoped Trainee Records ({total})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing candidates filtered by role access: <span className="font-semibold text-gray-700">{scope || 'Global'}</span>
            </p>
          </div>
          <a
            href="/trainees"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors text-[#6c5ce7]"
          >
            View Full Database →
          </a>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading scoped records...</div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-indigo-50 text-[#6c5ce7]">
              <Users size={24} />
            </div>
            <p className="text-sm font-semibold text-gray-700">No trainees found for this scope</p>
            <p className="text-xs text-gray-400 mt-1">Register new candidates to view longitudinal outcomes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Institute</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4 text-center">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trainees.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{t.name}</td>
                    <td className="py-3 px-4 text-gray-600">{t.institute_name}</td>
                    <td className="py-3 px-4 text-gray-600">{t.course_name}</td>
                    <td className="py-3 px-4 text-gray-600">{t.district}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        t.current_status === 'Employed' || t.current_status === 'Self-Employed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {t.current_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
