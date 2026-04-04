import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import TransactionInput from './components/Input/TransactionInput';
import HistoryPage from './components/History/HistoryPage';
import WeeklyChart from './components/Charts/WeeklyChart';

/**
 * ProtectedRoute component that redirects to login if the user is not authenticated.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="loader-premium"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
}

/**
 * PublicRoute component that redirects to home if the user is already authenticated.
 */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  // Public routes (Auth) don't use MainLayout (the dashboard sidebar)
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Main App Routes (Protected) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
         path="/dashboard"
         element={
           <ProtectedRoute>
             <DashboardPage />
           </ProtectedRoute>
         }
       />
      <Route
        path="/input"
        element={
          <ProtectedRoute>
            <TransactionInput />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add"
        element={<Navigate to="/input" replace />}
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/charts"
        element={
          <ProtectedRoute>
            <WeeklyChart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/udhaar"
        element={
          <ProtectedRoute>
            <div className="page-wrapper container">
              <h1 className="text-3xl font-display font-bold mb-4">Udhaar Management</h1>
              <p className="text-slate-500 italic">This feature is coming soon in your next update!</p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
