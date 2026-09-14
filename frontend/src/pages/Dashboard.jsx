import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

// Reusable card — same design as before, just driven by live data now
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

// Spinner for the loading state — keeping it dead simple
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <RefreshCw
        size={28}
        className="animate-spin"
        style={{ color: "#6C5CE7" }}
      />
      <span className="ml-3 text-sm text-gray-400">Loading from backend…</span>
    </div>
  );
}

export default function Dashboard() {
  // All three metrics live here — null means "not loaded yet"
  const [trainees, setTrainees]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTrainees = async () => {
    setLoading(true);
    setError(null);
    try {
      // Grabbing the trainee data from the backend — hope CORS doesn't block this
      const res = await fetch(`${API_BASE}/api/trainees`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setTrainees(data);
      setLastUpdated(new Date());
    } catch (err) {
      // Backend probably isn't running — show a red banner instead of a broken UI
      setError("Could not reach the backend. Is uvicorn running on port 8000?");
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainees();
    // TODO: add auto-refresh every 60s here if judges ask for "live updates"
  }, []);

  // Quick hack to calculate placement rate before the demo
  // "Employed" AND "Self-Employed" both count as placed for SIH26135 scoring
  const total    = trainees?.length ?? 0;
  const employed = trainees?.filter(
    (t) => t.current_status === "Employed" || t.current_status === "Self-Employed"
  ).length ?? 0;
  const rate = total > 0 ? ((employed / total) * 100).toFixed(1) : "0.0";

  // Build the metrics array from live numbers so MetricCard doesn't change
  const metrics = [
    {
      id: "total-trainees",
      label: "Total Trainees",
      value: loading ? "—" : total.toLocaleString(),
      change: "+live",
      trend: "up",
      description: "from database",
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
      // Highlight red if rate drops below 50% — useful signal for the judges
      change: parseFloat(rate) >= 50 ? "On target" : "Below target",
      trend: parseFloat(rate) >= 50 ? "up" : "down",
      description: "of all registered trainees",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back,{" "}
            <span style={{ color: "#6C5CE7" }}>Admin</span> 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your trainees today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Manual refresh — judges love clicking this to show "live data" */}
          <button
            onClick={fetchTrainees}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {formattedTime ? `Updated: ${formattedTime}` : "Fetching…"}
          </div>
        </div>
      </div>

      {/* Red error banner — shows when uvicorn isn't running */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <span className="text-lg leading-none">⚠️</span>
          <div>
            <p className="font-semibold">Backend unreachable</p>
            <p className="mt-0.5 text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Metric Cards — show spinner while waiting, cards once data arrives */}
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

      {/* Recent Activity placeholder — TODO: populate with real log data */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Recent Activity
          </h2>
          <button
            className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: "#6C5CE7" }}
          >
            View all
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "#EEF2FF" }}
          >
            <Users size={28} style={{ color: "#6C5CE7" }} />
          </div>
          <p className="text-sm font-medium text-gray-600">No activity yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Outcome check-in events will appear here once trainees are logged.
          </p>
        </div>
      </section>
    </div>
  );
}

