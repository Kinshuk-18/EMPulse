import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function UserDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user}!</h1>
        <p className="text-sm text-slate-500 mt-1">Skilling Center Operator Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">
            👥
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">My Center's Trainees</p>
            <p className="text-2xl font-bold text-slate-900">142</p>
          </div>
        </div>
        
        {/* Forcing Tailwind classes here because v4 is being stubborn */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl">
            ✅
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Enrollments</p>
            <p className="text-2xl font-bold text-slate-900">89</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-xl">
            🏢
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Placements</p>
            <p className="text-2xl font-bold text-slate-900">53</p>
          </div>
        </div>
      </div>
    </div>
  );
}
