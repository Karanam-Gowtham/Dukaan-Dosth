import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, aiAPI } from '../../services/api';
import { FiTrendingUp, FiTrendingDown, FiShield, FiUserPlus, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { t } = useTranslation();
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
      const [summaryRes, transactionsRes] = await Promise.all([
        dashboardAPI.getToday(),
        dashboardAPI.getRecent(5) // Not yet in api.js, will use fallback or add
      ]);
      
      setSummary(summaryRes.data);
      setRecentTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await aiAPI.getDailySummary();
      setAiSummary(res.data.summary);
    } catch (err) {
      console.error('AI Summary error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-skeleton page">
        <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
        <div className="quick-actions mt-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header mb-6">
        <h2 className="text-xl font-bold">
          {t('dashboard.greeting')}, {user?.ownerName} 👋
        </h2>
        <p className="text-muted">{t('app_tagline')}</p>
      </header>

      {/* Summary Stat Cards */}
      <div className="quick-actions">
        <div className="stat-card sale">
          <div className="stat-icon text-success"><FiTrendingUp /></div>
          <div className="stat-label">{t('dashboard.total_sales')}</div>
          <div className="stat-value text-success">₹{summary.todaySales.toLocaleString()}</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon text-danger"><FiTrendingDown /></div>
          <div className="stat-label">{t('dashboard.total_expenses')}</div>
          <div className="stat-value text-danger">₹{summary.todayExpenses.toLocaleString()}</div>
        </div>
        <div className="stat-card profit">
          <div className="stat-icon text-primary"><FiShield /></div>
          <div className="stat-label">{t('dashboard.net_profit')}</div>
          <div className="stat-value text-primary">₹{summary.netProfit.toLocaleString()}</div>
        </div>
        <div className="stat-card udhaar">
          <div className="stat-icon text-udhaar"><FiUserPlus /></div>
          <div className="stat-label">{t('dashboard.pending_udhaar')}</div>
          <div className="stat-value text-udhaar">₹{summary.pendingUdhaar.toLocaleString()}</div>
        </div>
      </div>

      {/* AI Summary Section */}
      <section className="mt-8 mb-8">
        <div className="section-header flex justify-between items-center mb-4">
          <h3 className="font-bold">{t('dashboard.ai_summary')}</h3>
          {!aiSummary && (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
            >
              {summaryLoading ? t('common.loading') : t('dashboard.generate_summary')}
            </button>
          )}
        </div>
        
        {aiSummary ? (
          <div className="ai-summary">
            <div className="ai-summary-title">✨ {t('dashboard.ai_summary')}</div>
            <p className="ai-summary-text">{aiSummary}</p>
          </div>
        ) : (
          <div className="card-glass p-4 text-center text-muted">
            {summaryLoading ? t('common.loading') : t('dashboard.ai_summary_placeholder')}
          </div>
        )}
      </section>

      {/* Recent Transactions List */}
      <section className="recent-transactions mt-8">
        <div className="section-header flex justify-between items-center mb-4">
          <h3 className="font-bold">{t('dashboard.recent')}</h3>
          <Link to="/history" className="btn-ghost flex items-center gap-1 text-sm text-primary">
            {t('history.view_all')} <FiArrowRight />
          </Link>
        </div>

        <div className="transaction-list mt-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item mb-3">
                <div className={`transaction-icon ${tx.type.toLowerCase()}`}>
                  {tx.type === 'SALE' ? '💰' : tx.type === 'EXPENSE' ? '📉' : '🤝'}
                </div>
                <div className="transaction-details">
                  <div className="transaction-desc">{tx.description}</div>
                  <div className="transaction-meta">{tx.category} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div className={`transaction-amount ${tx.type === 'SALE' ? 'positive' : tx.type === 'EXPENSE' ? 'negative' : 'udhaar'}`}>
                  {tx.type === 'SALE' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="card-glass p-8 text-center text-muted">
              <p>{t('dashboard.no_transactions')}</p>
              <Link to="/add" className="btn btn-outline mt-4">{t('nav.add')}</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
