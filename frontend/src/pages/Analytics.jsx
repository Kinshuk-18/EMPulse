import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Award,
  RefreshCw,
  MapPin,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Target,
} from 'lucide-react';

// Deep analytics view based on user scope — this replaces the old placeholder stub
// that was showing blank for Nodal and Institute roles.
// Centralized API URL — no more localhost drift between team members' machines
import { BASE_URL } from '../config';


// ── Reusable horizontal bar chart row ─────────────────────────────────────────
function BarRow({ label, value, max, color, suffix = '', pctLabel }) {
  const pct = max > 0 ? Math.round(Math.min(Math.max((value / max) * 100, 0), 100)) : 0;
  const display = pctLabel ?? `${pct}%`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700 truncate max-w-[60%]">{label}</span>
        <span className="font-bold text-gray-900 flex-shrink-0">
          {value}{suffix}
          <span className="text-gray-400 font-normal ml-1">({display})</span>
        </span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Section wrapper — keeps all cards looking uniform ─────────────────────────
function SectionCard({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex flex-col gap-1 mb-5">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-[#6c5ce7] flex-shrink-0" />
          <h2 className="text-sm font-bold text-gray-800">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 pl-6">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
        <BarChart3 size={20} className="text-gray-300" />
      </div>
      <p className="text-xs text-gray-400">{message}</p>
    </div>
  );
}

// ── Stat pill used inside summary strips ──────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  );
}

// ── Milestone retention data — computed from trainee graduation dates ──────────
// In production these numbers come from GROUP BY check-in month on outcome_logs.
// For demo, we derive them from the trainee list using graduation_date offsets.
function computeRetentionData(trainees) {
  const now = new Date();
  const total = trainees.length;
  if (total === 0) return null;

  let at3m = 0, at6m = 0, at12m = 0;
  trainees.forEach((t) => {
    if (!t.graduation_date) return;
    const grad = new Date(t.graduation_date);
    const monthsElapsed = (now - grad) / (1000 * 60 * 60 * 24 * 30.44);
    if (monthsElapsed >= 3) at3m++;
    if (monthsElapsed >= 6) at6m++;
    if (monthsElapsed >= 12) at12m++;
  });

  return [
    { label: '3-Month Check-In', value: at3m, pct: total > 0 ? ((at3m / total) * 100).toFixed(0) : 0 },
    { label: '6-Month Check-In', value: at6m, pct: total > 0 ? ((at6m / total) * 100).toFixed(0) : 0 },
    { label: '12-Month Check-In', value: at12m, pct: total > 0 ? ((at12m / total) * 100).toFixed(0) : 0 },
  ];
}

// ── Sector employment map — hardcoded sector categories matched by course keywords ──
const SECTOR_MAP = [
  { sector: 'Manufacturing & Engineering', keywords: ['electrician', 'fitter', 'welder', 'machinist', 'mechanic', 'turner', 'plumber'], color: '#6c5ce7' },
  { sector: 'IT & Electronics', keywords: ['computer', 'electronics', 'copa', 'ict', 'it ', 'software', 'hardware'], color: '#0984e3' },
  { sector: 'Construction & Civil', keywords: ['civil', 'mason', 'construction', 'carpenter', 'painter', 'surveyor'], color: '#e17055' },
  { sector: 'Health & Paramedical', keywords: ['health', 'paramedical', 'nursing', 'pharmacist', 'lab'], color: '#00b894' },
  { sector: 'Automotive', keywords: ['automobile', 'automotive', 'motor', 'vehicle', 'diesel'], color: '#fdcb6e' },
  { sector: 'Other / General', keywords: [], color: '#b2bec3' }, // catch-all
];

function getSector(courseName = '') {
  const lower = courseName.toLowerCase();
  for (const s of SECTOR_MAP) {
    if (s.keywords.some((kw) => lower.includes(kw))) return s.sector;
  }
  return 'Other / General';
}

// ────────────────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const { role, scope, district, instituteName } = useContext(AuthContext);

  const [trainees, setTrainees] = useState(null);
  const [longData, setLongData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Derive title/scope badge exactly the same way Dashboard does it
  let pageTitle = 'National Skilling Analytics';
  let scopeLabel = 'National Scope';
  let ScopeIcon = ShieldCheck;

  if (role === 'nodal') {
    pageTitle = `${scope || 'Region'} District Analytics`;
    scopeLabel = `District: ${scope || 'Bhopal'}`;
    ScopeIcon = MapPin;
  } else if (role === 'institute') {
    pageTitle = instituteName || scope || 'Center Analytics';
    scopeLabel = `Institute: ${instituteName || scope || 'Govt ITI'}`;
    ScopeIcon = Building2;
  }

  // Same RBAC-aware fetch as Dashboard — the backend scopes the data automatically
  const fetchTrainees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (scope) params.append('scope', scope);
      if (district) params.append('district', district);
      if (instituteName) params.append('institute_name', instituteName);

      // RBAC-scoped trainee fetch — same filtering logic as Dashboard
      const res = await fetch(`${BASE_URL}/api/trainees?${params.toString()}`);
      const longRes = await fetch(`${BASE_URL}/api/analytics/longitudinal?${params.toString()}`);

      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setTrainees(data);

      if (longRes.ok) {
        const lData = await longRes.json();
        setLongData(lData);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError('Could not reach backend. Is uvicorn running?');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [role, scope, district, instituteName]);

  useEffect(() => {
    fetchTrainees();
  }, [fetchTrainees]);

  // ── All derived metrics — computed client-side from the RBAC-scoped list ──────
  const total = trainees?.length ?? 0;
  const employed = trainees?.filter(
    (t) => t.current_status === 'Employed' || t.current_status === 'Self-Employed'
  ).length ?? 0;
  const searching = trainees?.filter((t) => t.current_status === 'Searching').length ?? 0;
  const unemployed = trainees?.filter((t) => t.current_status === 'Unemployed').length ?? 0;
  const placementRate = total > 0 ? ((employed / total) * 100).toFixed(1) : '0.0';

  // Course-wise placement data — group trainees by course, calc rate per course
  const courseMap = {};
  trainees?.forEach((t) => {
    const c = t.course_name || 'Unknown';
    if (!courseMap[c]) courseMap[c] = { total: 0, employed: 0 };
    courseMap[c].total++;
    if (t.current_status === 'Employed' || t.current_status === 'Self-Employed') {
      courseMap[c].employed++;
    }
  });
  const courseEntries = Object.entries(courseMap)
    .map(([name, d]) => ({
      name,
      total: d.total,
      employed: d.employed,
      rate: d.total > 0 ? Math.round((d.employed / d.total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8);
  const maxCourseTotal = Math.max(...courseEntries.map((c) => c.total), 1);

  // Sector breakdown — group by inferred sector
  const sectorMap = {};
  trainees?.forEach((t) => {
    const sec = getSector(t.course_name);
    if (!sectorMap[sec]) sectorMap[sec] = { total: 0, employed: 0 };
    sectorMap[sec].total++;
    if (t.current_status === 'Employed' || t.current_status === 'Self-Employed') {
      sectorMap[sec].employed++;
    }
  });
  const sectorEntries = Object.entries(sectorMap)
    .map(([sec, d]) => ({
      sector: sec,
      total: d.total,
      employed: d.employed,
      rate: d.total > 0 ? Math.round((d.employed / d.total) * 100) : 0,
      color: SECTOR_MAP.find((s) => s.sector === sec)?.color ?? '#b2bec3',
    }))
    .sort((a, b) => b.total - a.total);
  const maxSectorTotal = Math.max(...sectorEntries.map((s) => s.total), 1);

  // Retention timeline data
  const retentionData = trainees ? computeRetentionData(trainees) : null;

  // District breakdown (only meaningful for Admin scope — for Nodal/Institute it collapses to one row)
  const districtMap = {};
  trainees?.forEach((t) => {
    const d = t.district || 'Unknown';
    if (!districtMap[d]) districtMap[d] = { total: 0, employed: 0 };
    districtMap[d].total++;
    if (t.current_status === 'Employed' || t.current_status === 'Self-Employed') {
      districtMap[d].employed++;
    }
  });
  const districtEntries = Object.entries(districtMap)
    .map(([dist, d]) => ({
      district: dist,
      total: d.total,
      employed: d.employed,
      rate: d.total > 0 ? Math.round((d.employed / d.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const maxDistTotal = Math.max(...districtEntries.map((d) => d.total), 1);

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-xs font-semibold text-[#6c5ce7] mb-2 border border-indigo-100">
            <ScopeIcon size={13} />
            <span>{scopeLabel}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Deep analytics • Longitudinal outcome tracking • Cohort-level insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="analytics-refresh-btn"
            onClick={fetchTrainees}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#6c5ce7]' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {formattedTime ? `Updated ${formattedTime}` : 'Connecting...'}
          </div>
        </div>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 shadow-sm">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Backend Unreachable</p>
            <p className="mt-0.5 text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* ── Loading State ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center gap-3">
          <RefreshCw size={22} className="animate-spin text-[#6c5ce7]" />
          <span className="text-sm text-gray-400 font-medium">
            Fetching {scopeLabel} data...
          </span>
        </div>
      )}

      {!loading && !error && trainees && (
        <>
          {/* ── Top-Level Summary Strip ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatPill label="Total Trainees" value={total.toLocaleString()} color="#6c5ce7" />
            <StatPill label="Employed / Self-Empl." value={employed.toLocaleString()} color="#22c55e" />
            <StatPill label="Placement Rate" value={`${placementRate}%`} color="#f97316" />
            <StatPill label="Actively Searching" value={searching.toLocaleString()} color="#3b82f6" />
          </div>

          {/* ── Section 1: Course-wise Placement Rates ──────────────────────── */}
          <SectionCard
            icon={Award}
            title="Course-wise Placement Rates"
            subtitle={`Top courses by trainee volume — placement rate shown per trade. Scope: ${scopeLabel}`}
          >
            {courseEntries.length === 0 ? (
              <EmptyState message="No course data available for this scope yet." />
            ) : (
              <div className="space-y-4">
                {courseEntries.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700 truncate max-w-[55%]">{c.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-400">{c.employed}/{c.total} placed</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            c.rate >= 60
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.rate >= 35
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {c.rate}%
                        </span>
                      </div>
                    </div>
                    {/* Two-layer bar: total volume (gray) overlaid by employed (green) */}
                    <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.round(Math.min(Math.max((c.total / maxCourseTotal) * 100, 0), 100))}%`,
                          backgroundColor: '#e5e7eb',
                        }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.round(Math.min(Math.max((c.employed / maxCourseTotal) * 100, 0), 100))}%`,
                          backgroundColor: c.rate >= 60 ? '#22c55e' : c.rate >= 35 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                  Green ≥60% • Amber 35–59% • Red &lt;35% — target national placement benchmark is 60%
                </p>
              </div>
            )}
          </SectionCard>

          {/* ── Phase 7: Longitudinal Insights ──────────────────────────────── */}
          {longData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <SectionCard
                icon={TrendingUp}
                title="Wage Progression & Relevance"
                subtitle="Average wage growth and training relevance score"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500">Initial Wage</p>
                      <p className="font-bold text-gray-900">₹{Math.round(longData.wage_progression?.average_initial || 0).toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="text-emerald-500" />
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Current Wage</p>
                      <p className="font-bold text-emerald-600">₹{Math.round(longData.wage_progression?.average_current || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Wage Growth</span>
                    <span className="font-bold text-emerald-600">+{longData.wage_progression?.growth_percent?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Training Relevance Score</span>
                    <span className="font-bold text-indigo-600">{longData.training_relevance?.average_score?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={AlertTriangle}
                title="Attrition & Skill Gaps"
                subtitle="Top reasons for drop-out and identified skill gaps"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Top Skill Gaps</h4>
                    {Object.entries(longData.skill_gaps || {}).map(([gap, count]) => (
                      <div key={gap} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 truncate pr-2">{gap}</span>
                        <span className="font-bold text-gray-900">{count}</span>
                      </div>
                    ))}
                    {Object.keys(longData.skill_gaps || {}).length === 0 && (
                      <p className="text-xs text-gray-400">No skill gap data.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Attrition Reasons</h4>
                    {Object.entries(longData.attrition_reasons || {}).map(([reason, count]) => (
                      <div key={reason} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 truncate pr-2">{reason}</span>
                        <span className="font-bold text-red-600">{count}</span>
                      </div>
                    ))}
                    {Object.keys(longData.attrition_reasons || {}).length === 0 && (
                      <p className="text-xs text-gray-400">No attrition data.</p>
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ── Section 2: Milestone Retention & Sector Breakdown (side-by-side) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Milestone Retention Funnel */}
            <SectionCard
              icon={Clock}
              title="Longitudinal Cohort Retention"
              subtitle="Trainees eligible for each check-in milestone based on graduation date"
            >
              {retentionData ? (
                <div className="space-y-6">
                  {retentionData.map((m, idx) => {
                    const funnelColors = ['#6c5ce7', '#0984e3', '#00b894'];
                    return (
                      <div key={m.label} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: funnelColors[idx] }}
                            />
                            <span className="font-semibold text-gray-700">{m.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">{m.value} trainees</span>
                            <span
                              className="font-bold px-2 py-0.5 rounded-full text-[11px] bg-indigo-50 text-[#6c5ce7] border border-indigo-100"
                            >
                              {m.pct}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: total > 0 ? `${Math.round(Math.min(Math.max((m.value / total) * 100, 0), 100))}%` : '0%',
                              backgroundColor: funnelColors[idx],
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {m.value} of {total} trainees have crossed the {m.label.toLowerCase()} date
                        </p>
                      </div>
                    );
                  })}

                  {/* Outcome status summary beneath the funnel */}
                  <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center text-xs">
                    {[
                      { label: 'Employed', value: employed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Searching', value: searching, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Unemployed', value: unemployed, color: 'text-red-500', bg: 'bg-red-50' },
                    ].map((s) => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState message="No date data available to compute retention milestones." />
              )}
            </SectionCard>

            {/* Sector-wise Employment Breakdown */}
            <SectionCard
              icon={Target}
              title="Sector-wise Employment Breakdown"
              subtitle="Trainee volume and placement rates grouped by industry sector"
            >
              {sectorEntries.length === 0 ? (
                <EmptyState message="No sector data available for this scope." />
              ) : (
                <div className="space-y-4">
                  {sectorEntries.map((s) => (
                    <div key={s.sector} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="font-medium text-gray-700 truncate">{s.sector}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-gray-400 text-[11px]">{s.total} trainees</span>
                          <span
                            className="font-bold text-[11px] px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${s.color}18`,
                              color: s.color,
                            }}
                          >
                            {s.rate}% placed
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.round(Math.min(Math.max((s.total / maxSectorTotal) * 100, 0), 100))}%`,
                            backgroundColor: s.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Section 3: District / Institute Comparison (role-conditional) ── */}
          {role === 'admin' && districtEntries.length > 1 && (
            <SectionCard
              icon={MapPin}
              title="District-wise Comparative View"
              subtitle="National scope — trainee volume and placement rate by district"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Volume bars */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Trainee Volume</p>
                  {districtEntries.map((d, i) => {
                    const distColors = ['#6c5ce7', '#0984e3', '#00b894', '#fdcb6e', '#e17055', '#b2bec3'];
                    return (
                      <BarRow
                        key={d.district}
                        label={d.district}
                        value={d.total}
                        max={maxDistTotal}
                        color={distColors[i % distColors.length]}
                      />
                    );
                  })}
                </div>
                {/* Placement rate bars */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Placement Rate</p>
                  {districtEntries.map((d) => (
                    <BarRow
                      key={d.district}
                      label={d.district}
                      value={d.rate}
                      max={100}
                      color={d.rate >= 60 ? '#22c55e' : d.rate >= 35 ? '#f59e0b' : '#ef4444'}
                      suffix="%"
                      pctLabel={`${d.rate}%`}
                    />
                  ))}
                </div>
              </div>

              {/* District summary table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 text-left">District</th>
                      <th className="py-3 px-4 text-right">Trainees</th>
                      <th className="py-3 px-4 text-right">Employed</th>
                      <th className="py-3 px-4 text-right">Searching</th>
                      <th className="py-3 px-4 text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {districtEntries.map((d) => (
                      <tr key={d.district} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-800">{d.district}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{d.total}</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-semibold">{d.employed}</td>
                        <td className="py-3 px-4 text-right text-amber-600">
                          {trainees.filter((t) => t.district === d.district && t.current_status === 'Searching').length}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              d.rate >= 60
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : d.rate >= 35
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}
                          >
                            {d.rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Nodal view: show institute breakdown instead of district (district is already scoped) */}
          {role === 'nodal' && (
            <SectionCard
              icon={Building2}
              title="Institute Comparison — District Scope"
              subtitle={`Trainee outcomes across all institutes registered in ${scope || 'your district'}`}
            >
              {(() => {
                // Group by institute_name within the already-scoped trainee list
                const instMap = {};
                trainees.forEach((t) => {
                  const n = t.institute_name || 'Unknown';
                  if (!instMap[n]) instMap[n] = { total: 0, employed: 0 };
                  instMap[n].total++;
                  if (t.current_status === 'Employed' || t.current_status === 'Self-Employed') instMap[n].employed++;
                });
                const entries = Object.entries(instMap)
                  .map(([name, d]) => ({
                    name,
                    total: d.total,
                    employed: d.employed,
                    rate: d.total > 0 ? Math.round((d.employed / d.total) * 100) : 0,
                  }))
                  .sort((a, b) => b.total - a.total);
                const maxT = Math.max(...entries.map((e) => e.total), 1);
                const instColors = ['#6c5ce7', '#0984e3', '#00b894', '#fdcb6e', '#e17055'];

                if (entries.length === 0) return <EmptyState message="No institute data for this district scope." />;

                return (
                  <div className="space-y-4">
                    {entries.map((e, i) => (
                      <div key={e.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-700 truncate max-w-[55%]">{e.name}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-gray-400">{e.total} trainees</span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                                e.rate >= 60
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {e.rate}% placed
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.round(Math.min(Math.max((e.total / maxT) * 100, 0), 100))}%`,
                              backgroundColor: instColors[i % instColors.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </SectionCard>
          )}

          {/* Institute view: deeper course + cohort summary for this center */}
          {role === 'institute' && (
            <SectionCard
              icon={CheckCircle2}
              title="Center Performance Summary"
              subtitle={`Detailed outcome breakdown for ${instituteName || scope || 'this institute'}`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Enrolled', value: total, color: '#6c5ce7', bg: '#EEF2FF' },
                  { label: 'Placed', value: employed, color: '#22c55e', bg: '#F0FFF4' },
                  { label: 'Searching', value: searching, color: '#f59e0b', bg: '#FFFBEB' },
                  { label: 'Rate', value: `${placementRate}%`, color: '#f97316', bg: '#FFF7ED' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: s.bg }}
                  >
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Status distribution donut-style pill row */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Outcome Distribution</p>
                {[
                  { label: 'Employed', count: employed, color: '#22c55e' },
                  { label: 'Self-Employed', count: trainees.filter((t) => t.current_status === 'Self-Employed').length, color: '#10b981' },
                  { label: 'Searching', count: searching, color: '#f59e0b' },
                  { label: 'Unemployed', count: unemployed, color: '#ef4444' },
                ].map((s) => (
                  <BarRow
                    key={s.label}
                    label={s.label}
                    value={s.count}
                    max={total}
                    color={s.color}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Footer note ───────────────────────────────────────────────── */}
          <div className="text-center py-4 text-[11px] text-gray-400">
            All data is scoped to your RBAC access level •{' '}
            <span className="font-semibold text-gray-600">{scopeLabel}</span> •
            Last refreshed {formattedTime ?? '—'}
          </div>
        </>
      )}

      {/* Empty state when no trainees returned */}
      {!loading && !error && trainees && total === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Users size={28} className="text-[#6c5ce7]" />
          </div>
          <p className="text-base font-bold text-gray-700">No records in scope</p>
          <p className="text-xs text-gray-400 max-w-sm">
            No trainees are registered under <strong>{scopeLabel}</strong> yet.
            Add trainee records from the Trainees page to populate these analytics.
          </p>
        </div>
      )}
    </div>
  );
}
