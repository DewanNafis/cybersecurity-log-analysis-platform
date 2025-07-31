import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LogProvider } from './contexts/LogContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LogAnalysis from './pages/LogAnalysis';
import ThreatDetection from './pages/ThreatDetection';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<LogAnalysis />} />
        <Route path="/threats" element={<ThreatDetection />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <LogProvider>
            <div className="min-h-screen bg-gray-900 text-white">
              <AppRoutes />
            </div>
          </LogProvider>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;