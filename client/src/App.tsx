import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AuthPortal } from './pages/AuthPortal';
import { FieldsPage } from './pages/FieldsPage';
import { FieldDetailPage } from './pages/FieldDetailPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { AdvisoryReportPage } from './pages/AdvisoryReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<AuthPortal initialMode="login" />} />
          <Route path="/register" element={<AuthPortal initialMode="register" />} />
          <Route
            path="/fields"
            element={
              <ProtectedRoute>
                <FieldsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fields/:id"
            element={
              <ProtectedRoute>
                <FieldDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advisory/new"
            element={
              <ProtectedRoute>
                <AdvisoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advisory/:id"
            element={
              <ProtectedRoute>
                <AdvisoryReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="glass-panel border-t border-slate-900 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>AgriTech AI Assistant • Powered by Google Gemini Precision Models</div>
          <div>© {new Date().getFullYear()} Precision Agronomy Systems Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
