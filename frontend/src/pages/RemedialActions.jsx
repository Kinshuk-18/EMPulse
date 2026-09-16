import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';
import { ShieldAlert, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function RemedialActions() {
  const { role, scope } = useContext(AuthContext);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);

  const fetchActions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/remedial-actions?role=${role}&scope=${scope || ''}`);
      if (!res.ok) throw new Error("Failed to load remedial actions");
      const data = await res.json();
      setActions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [role, scope]);

  const handleApplyAction = async (actionId, actionType, target) => {
    setProcessing(actionId);
    try {
      const res = await fetch(`${BASE_URL}/api/remedial-actions/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action_id: actionId,
          action_type: actionType,
          target_institute: target
        })
      });
      if (!res.ok) throw new Error("Failed to apply action");
      
      // Remove the applied action from the list
      setActions(actions.filter(a => a.id !== actionId));
      alert(`Action ${actionId} approved and initiated successfully.`);
    } catch (err) {
      alert(`Error applying action: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Remedial Action Center</h1>
          <p className="text-sm text-gray-500 mt-1">Data-driven policy interventions and recommendations.</p>
        </div>
        <button onClick={fetchActions} className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50">
          Refresh Insights
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchActions} className="text-sm font-medium underline">Retry</button>
        </div>
      ) : actions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">All Clear</h3>
          <p className="text-gray-500">No urgent remedial actions recommended at this time.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.map(action => (
            <div key={action.id} className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 border-b border-gray-50 bg-red-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600">{action.action_type}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{action.recommended_action}</h3>
              </div>
              
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">Triggering Evidence</span>
                  <p className="text-sm text-gray-700">{action.triggering_evidence}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-400">Target</span>
                  <span className="text-xs font-medium text-gray-800">{action.target_entity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Estimated Impact</span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{action.impact_estimate}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  disabled={processing === action.id}
                  onClick={() => handleApplyAction(action.id, action.action_type, action.target_entity)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {processing === action.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Approve & Execute <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
