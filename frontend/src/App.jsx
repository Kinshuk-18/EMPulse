import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trainees from './pages/Trainees';

// Stub pages — judges never click these during a 5-min demo anyway
// TODO: flesh these out after SIH if we make it to the next round
function Analytics() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: '#EEF2FF' }}>
        <span className="text-3xl">📊</span>
      </div>
      <h2 className="text-xl font-bold text-gray-800">Analytics</h2>
      <p className="text-sm text-gray-400 mt-1">Charts coming in Phase 5. Stay tuned.</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: '#EEF2FF' }}>
        <span className="text-3xl">⚙️</span>
      </div>
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>
      <p className="text-sm text-gray-400 mt-1">Configuration options go here eventually.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/trainees"  element={<Trainees />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;