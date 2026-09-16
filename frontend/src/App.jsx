import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
// Hacking together the search context wrapper so Topbar can filter the Trainees table globally
import { SearchProvider } from './context/SearchContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Trainees from './pages/Trainees';
import Analytics from './pages/Analytics';
import RemedialActions from './pages/RemedialActions';
import Contact from './pages/Contact';

// Admin-only sidebar pages
import NodalOfficers from './pages/NodalOfficers';
import Institutes from './pages/Institutes';
import SupportTickets from './pages/SupportTickets';

// Loading fallback while lazy chunks load
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64 text-xs text-gray-400 font-medium">
      Loading page...
    </div>
  );
}


function Settings() {
  const { user, role, scope } = useContext(AuthContext);

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Portal Settings & RBAC Policy</h1>
        <p className="text-xs text-gray-500 mt-1">
          Role & Scope configuration for logged in officer.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 max-w-2xl">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Active Session Details
        </h2>
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

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

// AdminRoute: Additionally checks that the current user is admin — redirects to dashboard otherwise
const AdminRoute = ({ children }) => {
  const { user, role, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (role !== 'admin') {
    // Non-admins trying to access admin routes get silently redirected to dashboard
    return <Navigate to="/dashboard" replace />;
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
      {/* Public — Home / Login */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      {/* ── Protected routes shared across all roles ────────────────────── */}
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
        path="/remedial-actions"
        element={
          <AdminRoute>
            <Layout>
              <RemedialActions />
            </Layout>
          </AdminRoute>
        }
      />

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

      {/* ── Admin-only routes ────────────────────────────────────────────── */}
      <Route
        path="/nodal-officers"
        element={
          <AdminRoute>
            <Layout>
              <NodalOfficers />
            </Layout>
          </AdminRoute>
        }
      />

      <Route
        path="/institutes"
        element={
          <AdminRoute>
            <Layout>
              <Institutes />
            </Layout>
          </AdminRoute>
        }
      />

      <Route
        path="/support-tickets"
        element={
          <AdminRoute>
            <Layout>
              <SupportTickets />
            </Layout>
          </AdminRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <SearchProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </SearchProvider>
  );
}

export default App;