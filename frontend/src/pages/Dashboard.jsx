import {
  Users,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const metrics = [
  {
    id: "total-trainees",
    label: "Total Trainees",
    value: "1,284",
    change: "+12%",
    trend: "up",
    description: "vs. last month",
    icon: Users,
    iconBg: "#EEF2FF",
    iconColor: "#6C5CE7",
  },
  {
    id: "verified-employed",
    label: "Verified Employed",
    value: "876",
    change: "+8.4%",
    trend: "up",
    description: "vs. last month",
    icon: Briefcase,
    iconBg: "#F0FFF4",
    iconColor: "#22C55E",
  },
  {
    id: "placement-rate",
    label: "Placement Rate",
    value: "68.2%",
    change: "-2.1%",
    trend: "down",
    description: "vs. last month",
    icon: TrendingUp,
    iconBg: "#FFF7ED",
    iconColor: "#F97316",
  },
];

function MetricCard({ metric }) {
  const Icon = metric.icon;
  const isUp = metric.trend === "up";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{metric.label}</p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: metric.iconBg }}
        >
          <Icon size={20} style={{ color: metric.iconColor }} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">
          {metric.value}
        </p>
      </div>

      {/* Change Badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isUp
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
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

export default function Dashboard() {
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
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Last updated: just now
        </div>
      </div>

      {/* Metric Cards */}
      <section>
        <h2 className="sr-only">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Placeholder Content Area */}
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
            Trainee actions will appear here once data is available.
          </p>
        </div>
      </section>
    </div>
  );
}
