import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthPage from './pages/Auth/AuthPage';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SalesPage from './pages/Sales/SalesPage';
import ExpensesPage from './pages/Expenses/ExpensesPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import UdhaarPage from './pages/Udhaar/UdhaarPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import HistoryPage from './pages/Analytics/HistoryPage';
import AIInsightsPage from './pages/AIInsights/AIInsightsPage';
import AIAssistant from './components/AIAssistant/AIAssistant';
import TransactionInput from './components/AIAssistant/TransactionInput';
import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="app-loader"><span className="app-loader-icon">🦋</span></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="app-loader"><span className="app-loader-icon">🦋</span></div>;
  return !isAuthenticated ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="udhaar" element={<UdhaarPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ledger" element={<HistoryPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        <Route path="add" element={<TransactionInput />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
        <AIAssistant />
      </ToastProvider>
    </AuthProvider>
  );
}
