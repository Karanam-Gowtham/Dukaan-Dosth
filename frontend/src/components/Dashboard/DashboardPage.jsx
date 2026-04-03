import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, aiAPI, transactionAPI } from '../../services/api';
import { FiTrendingUp, FiTrendingDown, FiShield, FiUserPlus, FiArrowRight, FiZap, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [summary, setSummary] = useState({
    todaySales: 0,
    todayExpenses: 0,
    netProfit: 0,
    pendingUdhaar: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get all dashboard data
      const [summaryRes, transactionsRes, recentRes] = await Promise.all([
        dashboardAPI.getToday(),
        transactionAPI.getToday(),
        dashboardAPI.getRecent(5)
      ]);
      
      setSummary(summaryRes.data);
      setRecentTransactions(recentRes.data || []);
      
      // Store today's transactions for AI summary later
      window._todayTransactions = transactionsRes.data;
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setTimeout(() => setLoading(false), 300); // Smooth transition
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const transactions = window._todayTransactions || [];
      const lang = i18n.language === 'te' ? 'te' : 'en';
      const res = await aiAPI.getDailySummary(transactions, lang);
      setAiSummary(res.data.summary);
    } catch (err) {
      console.error('AI Summary error:', err);
      // Fallback message
      setAiSummary("Business is looking good! Keep recording your sales to get better insights.");
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page container">
        <div className="skeleton skeleton-text" style={{ width: '180px', height: '32px' }}></div>
        <div className="skeleton skeleton-text mt-2" style={{ width: '240px' }}></div>
        
        <div className="stat-grid mt-8">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '100px' }}></div>)}
        </div>

        <div className="skeleton skeleton-card mt-8" style={{ height: '150px' }}></div>
        <div className="skeleton skeleton-text mt-8" style={{ width: '120px' }}></div>
        <div className="skeleton skeleton-card mt-4" style={{ height: '300px' }}></div>
      </div>
    );
  }

  return (
    <div className="page container">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gradient">
          {t('dashboard.greeting')}, {user?.ownerName} 👋
        </h2>
        <p className="text-secondary">{t('app_tagline')}</p>
      </header>

      {/* Summary Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card-premium success">
          <div className="stat-label">{t('dashboard.total_sales')}</div>
          <div className="stat-value text-success">
            ₹{summary.todaySales?.toLocaleString() || 0}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-success">
            <FiTrendingUp /> {t('dashboard.sales_growth', 'Healthy')}
          </div>
        </div>

        <div className="stat-card-premium danger">
          <div className="stat-label">{t('dashboard.total_expenses')}</div>
          <div className="stat-value text-danger">
            ₹{summary.todayExpenses?.toLocaleString() || 0}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-danger">
            <FiTrendingDown /> {t('dashboard.expenses_check', 'Managed')}
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-label">{t('dashboard.net_profit')}</div>
          <div className="stat-value">
            ₹{summary.netProfit?.toLocaleString() || 0}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-secondary">
            <FiShield /> {t('dashboard.profit_status', 'Safe')}
          </div>
        </div>

        <div className="stat-card-premium udhaar">
          <div className="stat-label">{t('dashboard.pending_udhaar')}</div>
          <div className="stat-value text-udhaar">
            ₹{summary.pendingUdhaar?.toLocaleString() || 0}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-udhaar">
            <FiUserPlus /> {t('dashboard.credit_alert', 'Tracked')}
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiZap className="text-warning" /> {t('dashboard.ai_summary')}
          </h3>
          {!aiSummary && (
            <button 
              className="btn btn-primary" 
              style={{ minHeight: '36px', padding: '0.5rem 1rem', width: 'auto' }}
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
            >
              {summaryLoading ? t('common.loading') : t('dashboard.generate_summary')}
            </button>
          )}
        </div>
        
        {aiSummary ? (
          <div className="ai-summary">
            <div className="ai-summary-title">✨ AI {t('dashboard.ai_summary')}</div>
            <p className="ai-summary-text">{aiSummary}</p>
          </div>
        ) : (
          <div className="card-glass text-center p-8 border-dashed">
            {summaryLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="loader-premium"></div>
                <p className="text-secondary">{t('common.analyzing', 'Analyzing your records...')}</p>
              </div>
            ) : (
              <p className="text-muted">{t('dashboard.ai_summary_placeholder')}</p>
            )}
          </div>
        )}
      </section>

      {/* Recent Transactions List */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{t('dashboard.recent')}</h3>
          <Link to="/history" className="text-sm font-bold flex items-center gap-1 text-primary">
            {t('history.view_all')} <FiArrowRight />
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className={`transaction-icon ${tx.type.toLowerCase()}`}>
                  {tx.type === 'SALE' ? '💰' : tx.type === 'EXPENSE' ? '🧾' : '👤'}
                </div>
                <div className="transaction-details">
                  <div className="transaction-desc">{tx.description}</div>
                  <div className="transaction-meta">
                    {tx.category || 'General'} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className={`transaction-amount ${tx.type === 'SALE' ? 'positive' : tx.type === 'EXPENSE' ? 'negative' : 'udhaar'}`}>
                  {tx.type === 'SALE' ? '+' : '-'} ₹{tx.amount?.toLocaleString() || 0}
                </div>
              </div>
            ))
          ) : (
            <div className="card-glass p-12 text-center">
              <p className="text-muted mb-6">{t('dashboard.no_transactions')}</p>
              <Link to="/add" className="btn btn-primary inline-flex items-center gap-2" style={{ width: 'auto' }}>
                <FiPlus /> {t('nav.add')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAB (Floating Action Button) for adding transactions */}
      <Link to="/add" className="mic-btn-main fixed" style={{ bottom: '2rem', right: '1.5rem', width: '64px', height: '64px', fontSize: '1.8rem', zIndex: 1001 }}>
        <FiPlus />
      </Link>
    </div>
  );
}
