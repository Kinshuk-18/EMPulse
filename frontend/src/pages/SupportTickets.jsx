import { useState, useEffect } from 'react';
import {
  TicketCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';

const LS_KEY = 'empulse_support_tickets';

// Pull tickets out of localStorage — fallback to empty array
function loadTickets() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Write the full updated array back to localStorage
function saveTickets(tickets) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tickets));
  } catch {
    // localStorage quota exceeded — shouldn't happen in demo, but fail silently
    console.warn('SupportTickets: Could not persist to localStorage');
  }
}

// Status badge
function StatusBadge({ status }) {
  if (status === 'Resolved') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={10} /> Resolved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock size={10} /> Pending
    </span>
  );
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(null); // which ticket's message is expanded

  // Load from localStorage on mount — poll-free since this is the admin view only
  useEffect(() => {
    setTickets(loadTickets());
  }, []);

  const handleResolve = (id) => {
    const updated = tickets.map((t) =>
      t.id === id ? { ...t, status: 'Resolved' } : t
    );
    setTickets(updated);
    saveTickets(updated);
  };

  const handleRefresh = () => {
    setTickets(loadTickets());
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  // Real-time filter by name, role, subject, email
  const filtered = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      t.fullName?.toLowerCase().includes(q) ||
      t.roleScope?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
    );
  });

  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 mb-2">
            <TicketCheck size={14} /> Admin View — Support Tickets
          </div>
          <h1 className="text-2xl font-bold text-gray-900">National Helpdesk Tickets</h1>
          <p className="text-xs text-gray-500 mt-1">
            User-submitted support queries from Nodal Officers and Training Institutes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
              <AlertCircle size={14} />
              {pendingCount} Pending
            </div>
          )}
          <button
            id="tickets-refresh-btn"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer shadow-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input
          id="tickets-search"
          type="text"
          placeholder="Search by name, role, subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:border-[#6c5ce7] transition shadow-sm"
        />
      </div>

      {/* Empty state */}
      {tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 text-3xl">
            📋
          </div>
          <h2 className="text-base font-bold text-gray-800">No Tickets Submitted Yet</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            When Nodal Officers or Institute Admins submit queries from the Help &amp; Support page, they will appear here.
          </p>
          <p className="text-[11px] text-gray-300 font-mono mt-3">
            Source: localStorage key "{LS_KEY}"
          </p>
        </div>
      )}

      {/* Tickets Table */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-5">Ticket ID</th>
                  <th className="py-4 px-5">Sender</th>
                  <th className="py-4 px-5">Role / Institute</th>
                  <th className="py-4 px-5">Subject</th>
                  <th className="py-4 px-5">Timestamp</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filtered.map((ticket) => (
                  <>
                    <tr key={ticket.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-5 font-mono text-[#6c5ce7] font-bold">
                        {ticket.id}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-gray-900">{ticket.fullName}</div>
                        <div className="text-gray-400 font-mono mt-0.5">{ticket.email}</div>
                      </td>
                      <td className="py-4 px-5 text-gray-600">{ticket.roleScope}</td>
                      <td className="py-4 px-5 text-gray-700 font-medium">{ticket.subject}</td>
                      <td className="py-4 px-5 text-gray-400 font-mono whitespace-nowrap">
                        {new Date(ticket.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Expand/collapse message detail */}
                          <button
                            id={`ticket-expand-${ticket.id}`}
                            onClick={() => toggleExpand(ticket.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition"
                            title="Toggle query details"
                          >
                            {expanded === ticket.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            Details
                          </button>
                          {ticket.status === 'Pending' && (
                            <button
                              id={`ticket-resolve-${ticket.id}`}
                              onClick={() => handleResolve(ticket.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold cursor-pointer transition"
                              title="Mark as Resolved"
                            >
                              <CheckCircle2 size={12} /> Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Inline expanded query message row */}
                    {expanded === ticket.id && (
                      <tr key={`${ticket.id}-expanded`} className="bg-slate-50/80">
                        <td colSpan="7" className="px-5 py-4 border-b border-gray-100">
                          <div className="max-w-3xl space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              Full Query Details
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {ticket.message}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400 flex items-center justify-between">
            <span>{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</span>
            <span className="text-[10px] font-mono text-gray-300">
              Stored in localStorage • Persists across sessions
            </span>
          </div>
        </div>
      )}

      {/* No search results */}
      {tickets.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm text-xs text-gray-400">
          No tickets match "{searchQuery}".
        </div>
      )}
    </div>
  );
}
