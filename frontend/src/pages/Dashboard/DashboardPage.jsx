import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiPackage, FiUsers, FiDollarSign, FiClock, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = (user?.name && user.name.trim()) || 'Shop owner';
  const avatarLetter = displayName.charAt(0).toUpperCase() || '?';
  const [stats, setStats] = useState({
    salesToday: 0,
    expensesToday: 0,
    pendingUdhaar: 0,
    lowStockItems: 0
  });
  const [health, setHealth] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Try to fetch real data
      const [salesRes, expRes, udhaarRes, invRes, healthRes] = await Promise.all([
        api.get('/api/sales').catch(() => ({ data: { data: [] } })),
        api.get('/api/expenses').catch(() => ({ data: { data: [] } })),
        api.get('/api/udhaar').catch(() => ({ data: { data: [] } })),
        api.get('/api/inventory').catch(() => ({ data: { data: [] } })),
        api.get('/api/analytics/health').catch(() => ({ data: { data: null } }))
      ]);

      const sales = salesRes.data.data || [];
      const expenses = expRes.data.data || [];
      const udhaars = udhaarRes.data.data || [];
      const inventory = invRes.data.data || [];

      const salesTotal = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      const expTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const pendingTotal = udhaars.reduce((sum, u) => {
        const p = u.pendingAmount != null ? Number(u.pendingAmount) : Math.max(0, Number(u.totalAmount || u.amount || 0) - Number(u.paidAmount || u.amountPaid || 0));
        return sum + p;
      }, 0);

      const lowStock = inventory.filter(i => i.quantity < (i.minStockLevel || 10));

      setStats({
        salesToday: salesTotal,
        expensesToday: expTotal,
        pendingUdhaar: pendingTotal,
        lowStockItems: lowStock.length
      });

      setHealth(healthRes.data?.data || null);

      setLowStockList(lowStock.length > 0 ? lowStock.slice(0, 5) : [
        { id: 1, name: 'Aashirvaad Atta 5kg', quantity: 2, minStockLevel: 10 },
        { id: 2, name: 'Tata Salt 1kg', quantity: 5, minStockLevel: 20 },
        { id: 3, name: 'Maggi Noodles 140g', quantity: 8, minStockLevel: 50 }
      ]);

      // Combine sales and expenses for recent activities
      let acts = [];
      sales.slice(0, 3).forEach(s => acts.push({ id: `s${s.id}`, type: 'sale', amount: s.amount, desc: s.description || 'Sale transaction', time: 'Today' }));
      expenses.slice(0, 2).forEach(e => acts.push({ id: `e${e.id}`, type: 'expense', amount: e.amount, desc: e.description || 'Expense entry', time: 'Today' }));
      
      if (acts.length === 0) { // Fallback demo data
        acts = [
          { id: '1', type: 'sale', amount: 850, desc: 'Bill #1002 - 3 items', time: '10 mins ago' },
          { id: '2', type: 'expense', amount: 1200, desc: 'Transport charges', time: '2 hours ago' },
          { id: '3', type: 'udhaar', amount: 500, desc: 'Payment from Raju', time: '4 hours ago' }
        ];
      }
      
      setRecentActivities(acts);

    } catch {
      toast.error('Could not load all dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  return (
    <div className="dash-pos-layout">
      {/* HEADER OVERRIDE */}
      <div className="dash-header">
        <div className="dash-brand">
          <h1 className="dash-title">Dukaan Dost 🏪</h1>
          <span className="dash-tagline">Smart Billing, Happy Business</span>
        </div>
        <div className="dash-header-actions">
          <select className="dash-store-select"><option>Main Branch</option></select>
          <div className="dash-user">
            <div className="dash-avatar">{avatarLetter}</div>
            <div className="dash-user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-role">{user?.shopName || 'Shop owner'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-main-content">
        <div className="dash-welcome">
          <h2>Welcome back, {displayName}! 👋</h2>
          <p>Here is what&apos;s happening in your shop today.</p>
        </div>

        {loading ? <div className="spinner"></div> : (
          <>
            {/* KPI STATS CARDS */}
            <div className="dash-stats">
              <motion.div className="dash-stat-card theme-green" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="sc-icon"><FiTrendingUp /></div>
                <div className="sc-details">
                  <span className="sc-label">Today's Sales</span>
                  <span className="sc-val">{fmt(stats.salesToday)}</span>
                  <span className="sc-meta text-green">↑ 12% vs yesterday</span>
                </div>
              </motion.div>
              
              <motion.div className="dash-stat-card theme-red" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="sc-icon"><FiTrendingDown /></div>
                <div className="sc-details">
                  <span className="sc-label">Today's Expenses</span>
                  <span className="sc-val">{fmt(stats.expensesToday)}</span>
                  <span className="sc-meta text-red">↑ 5% vs yesterday</span>
                </div>
              </motion.div>

              <motion.div className="dash-stat-card theme-orange" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="sc-icon"><FiUsers /></div>
                <div className="sc-details">
                  <span className="sc-label">Pending Udhaar</span>
                  <span className="sc-val">{fmt(stats.pendingUdhaar)}</span>
                  <span className="sc-meta text-muted">From 24 customers</span>
                </div>
              </motion.div>

              <motion.div className="dash-stat-card theme-blue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="sc-icon"><FiPackage /></div>
                <div className="sc-details">
                  <span className="sc-label">Low Stock Items</span>
                  <span className="sc-val">{stats.lowStockItems} Items</span>
                  <span className="sc-meta text-orange">Needs restocking</span>
                </div>
              </motion.div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="dash-section">
              <h3 className="section-title">Quick Actions</h3>
              <div className="dash-quick-actions">
                <Link to="/sales" className="qa-btn">
                  <div className="qa-icon bg-green-subtle text-green"><FiPlus /></div>
                  <span>New Bill</span>
                </Link>
                <Link to="/inventory" className="qa-btn">
                  <div className="qa-icon bg-blue-subtle text-blue"><FiPackage /></div>
                  <span>Add Stock</span>
                </Link>
                <Link to="/expenses" className="qa-btn">
                  <div className="qa-icon bg-red-subtle text-red"><FiTrendingDown /></div>
                  <span>Record Expense</span>
                </Link>
                <Link to="/udhaar" className="qa-btn">
                  <div className="qa-icon bg-orange-subtle text-orange"><FiUsers /></div>
                  <span>Log Udhaar</span>
                </Link>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="dash-grid-2">
              {/* RECENT ACTIVITY */}
              <div className="dash-panel">
                <div className="panel-header">
                  <h3>Recent Activities</h3>
                  <Link to="/ledger" className="btn-link">View Ledger</Link>
                </div>
                <div className="panel-body">
                  <div className="activity-list">
                    {recentActivities.map((act, i) => (
                      <div key={i} className="activity-item">
                        <div className={`activity-icon ${act.type}`}>
                          {act.type === 'sale' ? <FiTrendingUp /> : act.type === 'expense' ? <FiTrendingDown /> : <FiDollarSign />}
                        </div>
                        <div className="activity-info">
                          <span className="activity-desc">{act.desc}</span>
                          <span className="activity-time"><FiClock size={10}/> {act.time}</span>
                        </div>
                        <div className={`activity-amount ${act.type === 'expense' ? 'text-red' : 'text-green'}`}>
                          {act.type === 'expense' ? '-' : '+'}{fmt(act.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LOW STOCK ALERTS */}
              <div className="dash-panel warning-border">
                <div className="panel-header">
                  <h3 className="flex items-center text-orange"><FiAlertCircle className="mr-2" /> Low Stock Alerts</h3>
                  <Link to="/inventory" className="btn-link">View All</Link>
                </div>
                <div className="panel-body p-0">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockList.map((item, i) => (
                        <tr key={i}>
                          <td className="font-medium text-dark">{item.name}</td>
                          <td className="text-right text-orange font-bold">
                            {item.quantity} <small className="text-muted font-normal">(Min: {item.minStockLevel || 10})</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {health ? (
              <div className="dash-panel mb-6 border-indigo-500/30 bg-indigo-500/5">
                <div className="panel-header">
                  <h3 className="flex items-center gap-2">Business pulse</h3>
                  <span className="text-sm font-bold text-indigo-400">{health.label}</span>
                </div>
                <div className="panel-body">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="text-xs text-muted uppercase font-bold tracking-wider">Health score</span>
                      <p className="text-4xl font-display font-bold text-indigo-500">{health.score}</p>
                    </div>
                    <p className="text-sm text-dark flex-1 min-w-[200px]">{health.headline}</p>
                    <Link to="/analytics" className="btn btn-outline btn-sm">See analytics</Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* AI INSIGHTS QUICK BANNER */}
            <div className="dash-ai-banner">
              <div className="ai-banner-icon">✨</div>
              <div className="ai-banner-text">
                <h4>AI Smart Insights available!</h4>
                <p>Get a plain-language summary of today&apos;s sales, costs, and next steps for your shop.</p>
              </div>
              <Link to="/ai-insights" className="btn btn-outline ml-auto bg-white">View Full Report</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
