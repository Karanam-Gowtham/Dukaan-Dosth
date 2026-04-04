import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiDownload, FiFilter, FiCalendar, FiEye, FiMoreVertical, FiTrendingUp, FiTrendingDown, FiArchive, FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './Expenses.css';

const TABS = ['All Transactions', 'Sales', 'Expenses', 'Payments', 'Udhaar', 'Adjustments'];

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Transactions');
  const [search, setSearch] = useState('');
  
  const toast = useToast();

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    setLoading(true);
    // In a real app we'd fetch from a unified unified ledger endpoint
    // Here we'll mock a combined list by fetching sales & expenses and merging them
    try {
      const [salesRes, expRes] = await Promise.all([
        api.get('/api/sales'),
        api.get('/api/expenses')
      ]);
      
      const sales = (salesRes.data.data || []).map(s => ({
        id: `S-${s.id}`,
        rawDate: new Date(s.date),
        date: new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: 'Sale',
        refId: `BILL-${1000 + s.id}`,
        description: s.description || 'Sale transaction',
        category: 'Customer Entry',
        amount: s.amount,
        paymentMethod: 'UPI'
      }));

      const expenses = (expRes.data.data || []).map(e => ({
        id: `E-${e.id}`,
        rawDate: new Date(e.date),
        date: new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date(e.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: 'Expense',
        refId: `EXP-${2000 + e.id}`,
        description: e.description || 'Expense entry',
        category: e.category || 'General',
        amount: -e.amount, // negative for expenses
        paymentMethod: 'Cash'
      }));

      // Dummy Udhaar Payment to meet mockup requirements
      const dummies = [
        { id: 'U-1', rawDate: new Date(), date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), time: '10:30 AM', type: 'Udhaar Payment', refId: 'UDH-501', description: 'Partial payment received', category: 'Raju Bhai', amount: 500, paymentMethod: 'Cash' }
      ];

      const merged = [...sales, ...expenses, ...dummies].sort((a, b) => b.rawDate - a.rawDate);
      setTransactions(merged);
    } catch {
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v) => `₹${Math.abs(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.refId.toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'All Transactions' || 
                      (activeTab === 'Sales' && t.type === 'Sale') ||
                      (activeTab === 'Expenses' && t.type === 'Expense') ||
                      (activeTab === 'Udhaar' && t.type.includes('Udhaar')) ||
                      (activeTab === 'Payments' && t.type.includes('Payment'));
      return matchSearch && matchTab;
    });
  }, [transactions, search, activeTab]);

  // Summaries
  const totalSales = transactions.filter(t => t.type === 'Sale').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netProfit = totalSales - totalExpenses;

  const getTypeStyle = (type) => {
    if (type === 'Sale') return 'badge-success';
    if (type === 'Expense') return 'badge-danger';
    return 'badge-warning'; // Udhaar
  };

  const getMethodIcon = (method) => {
    if (method === 'UPI') return <FiSmartphone />;
    if (method === 'Card') return <FiCreditCard />;
    return <FiDollarSign />; // Cash
  };

  return (
    <div className="ledger-layout">
      {/* HEADER */}
      <div className="ledger-header">
        <div className="ledger-brand">
          <h1 className="ledger-title">Dukaan Dost 🏪</h1>
          <span className="ledger-tagline">Smart Billing, Happy Business</span>
        </div>
        <div className="ledger-search-wrapper">
          <FiSearch className="ledger-search-icon" />
          <input 
            type="text" 
            placeholder="Search bills, items, or transactions..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="ledger-search"
          />
        </div>
        <div className="ledger-header-actions">
          <select className="ledger-store-select"><option>Srinivas Kirana Store</option></select>
        </div>
      </div>

      <div className="ledger-main-content">
        {/* TITLE SECTION */}
        <div className="ledger-title-section">
          <div>
            <h2>Transaction Ledger</h2>
            <p>View and track all your business transactions in one place</p>
          </div>
          <div className="ledger-title-actions">
            <button className="btn-icon outline" title="Filter"><FiFilter /></button>
            <button className="btn-icon outline" title="Export"><FiDownload /></button>
            <div className="date-range-picker">
              <FiCalendar /> <span>1 May 2024 - 10 May 2024</span>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="ledger-summary-cards">
          <div className="ledg-card">
            <div className="ledg-card-icon"><FiArchive /></div>
            <div className="ledg-card-info">
              <span className="ledg-label">Total Transactions</span>
              <span className="ledg-value">{transactions.length}</span>
            </div>
          </div>
          <div className="ledg-card">
            <div className="ledg-card-icon text-green bg-green-light"><FiTrendingUp /></div>
            <div className="ledg-card-info">
              <span className="ledg-label">Total Sales</span>
              <span className="ledg-value text-green">{fmt(totalSales)}</span>
            </div>
          </div>
          <div className="ledg-card">
            <div className="ledg-card-icon text-red bg-red-light"><FiTrendingDown /></div>
            <div className="ledg-card-info">
              <span className="ledg-label">Total Expenses</span>
              <span className="ledg-value text-red">{fmt(totalExpenses)}</span>
            </div>
          </div>
          <div className="ledg-card">
            <div className="ledg-card-icon text-blue bg-blue-light"><FiDollarSign /></div>
            <div className="ledg-card-info">
              <span className="ledg-label">Net Profit</span>
              <span className="ledg-value text-blue">{fmt(netProfit)}</span>
            </div>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="ledger-tabs">
          {TABS.map(tab => (
            <button 
              key={tab} 
              className={`ledg-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >{tab}</button>
          ))}
        </div>

        {/* TABLE */}
        <div className="ledger-table-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reference ID</th>
                <th>Description</th>
                <th>Category/Customer</th>
                <th className="text-right">Amount</th>
                <th>Payment Method</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner"></div></td></tr>
              ) : filtered.length > 0 ? filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="td-date">{t.date}</div>
                    <div className="td-time">{t.time}</div>
                  </td>
                  <td><span className={`ledg-badge ${getTypeStyle(t.type)}`}>{t.type}</span></td>
                  <td><span className="ref-id">{t.refId}</span></td>
                  <td><span className="td-desc">{t.description}</span></td>
                  <td>
                    <div className="td-cat">
                      <span className="cat-icon"></span> {t.category}
                    </div>
                  </td>
                  <td className="text-right">
                    <span className={`td-amount ${t.amount >= 0 ? 'text-green' : 'text-red'}`}>
                      {t.amount >= 0 ? '+' : '-'}{fmt(t.amount)}
                    </span>
                  </td>
                  <td>
                    <div className="td-method">
                      {getMethodIcon(t.paymentMethod)} {t.paymentMethod}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="td-actions">
                      <button className="btn-icon small text-muted"><FiEye /></button>
                      <button className="btn-icon small text-muted"><FiMoreVertical /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="text-center py-4 empty-text">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ledger-bottom">
          <div className="table-info">Showing {filtered.length} entries</div>
          <div className="table-pagination">
            <span className="rows-per-page">Rows: <strong>10</strong></span>
            <div className="page-controls">
              <button className="btn-page outline">&lt;</button>
              <button className="btn-page active">1</button>
              <button className="btn-page outline">2</button>
              <button className="btn-page outline">3</button>
              <button className="btn-page outline">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
