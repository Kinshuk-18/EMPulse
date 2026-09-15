import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Trainees from './pages/Trainees';
import Contact from './pages/Contact';

// Hackathon dev comment: Analytics and Settings stub components for the demo
function Analytics() {
  const { role, scope } = useContext(AuthContext);
  const title = role === 'nodal'
    ? `Bhopal Region Analytics`
    : role === 'institute'
      ? `Govt ITI Bhopal Center Analytics`
      : `National Skilling Analytics`;

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500 mt-1">Scope: {scope || 'Global'} • Longitudinal Outcomes</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-[#6c5ce7] rounded-full">
        </span>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[45vh] bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-indigo-50 text-[#6c5ce7]">
          <span className="text-3xl">📊</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800">Longitudinal Cohort Analytics</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-md">
          Comparative retention trends for 3, 6, and 12-month post-training milestones across registered institutes.
        </p>
      </div>
    </div>
  );
}

function Settings() {
  const { user, role, scope } = useContext(AuthContext);

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Portal Settings & RBAC Policy</h1>
        <p className="text-xs text-gray-500 mt-1">Role & Scope configuration for logged in officer.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 max-w-2xl">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Active Session Details</h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block">Logged User</span>
            <span className="font-bold text-gray-800 font-mono">{user}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block">Assigned Role</span>
            <span className="font-bold text-[#6c5ce7] capitalize">{role}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl col-span-2">
            <span className="text-gray-400 block">Assigned Access Scope</span>
            <span className="font-bold text-gray-800">{scope || 'Global Access'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ProtectedRoute: Ensures route is accessible ONLY if user is logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium text-xs">
        Verifying RBAC session token...
      </div>
    );
  }

  // If unauthenticated, redirect strictly to Home page (/)
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

// PublicRoute: If user is ALREADY logged in, redirect / to /dashboard
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Route / -> New Home / Login Page */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      {/* Protected App Routes wrapped in Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainees"
        element={
          <ProtectedRoute>
            <Layout>
              <Trainees />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Added /contact route accessible for all 3 RBAC roles */}
      <Route
        path="/contact"
        element={
          <ProtectedRoute>
            <Layout>
              <Contact />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;