import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { transactionAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FiSearch, FiFilter, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, SALE, EXPENSE, CREDIT_GIVEN, CREDIT_RECEIVED

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getToday(); // For now today, will use range or all
      setTransactions(res.data || []);
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = new Date(tx.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="history-skeleton page">
        {[1,2,3].map(i => <div key={i} className="skeleton skeleton-card mb-4"></div>)}
      </div>
    );
  }

  return (
    <div className="history-page">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('history.title')}</h2>
        <div className="history-actions flex gap-2">
          <FiCalendar className="text-lg text-muted" />
        </div>
      </header>

      {/* Search and Filter */}
      <div className="search-filter-container mb-6">
        <div className="input-wrapper mb-4">
          <FiSearch className="input-icon" />
          <input 
            type="text" 
            className="input" 
            placeholder={t('history.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tab-bar">
          {['ALL', 'SALE', 'EXPENSE', 'CREDIT_GIVEN'].map(f => (
            <button 
              key={f}
              className={`tab-item text-xs px-2 py-1 ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? t('history.all') : t(`input.${f.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="transaction-history-list">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).sort((a,b) => new Date(b) - new Date(a)).map(date => (
            <div key={date} className="date-group mb-6">
              <h4 className="date-header text-sm text-muted font-bold mb-3">{date}</h4>
              {groupedTransactions[date].map(tx => (
                <div key={tx.id} className="transaction-item mb-2" onClick={() => navigate(`/transaction/${tx.id}`)}>
                  <div className={`transaction-icon ${tx.type.toLowerCase()}`}>
                    {tx.type === 'SALE' ? '💰' : tx.type === 'EXPENSE' ? '📉' : '🤝'}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-desc">{tx.description}</div>
                    <div className="transaction-meta text-xs">{tx.category} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                  <div className={`transaction-amount ${tx.type === 'SALE' ? 'positive' : tx.type === 'EXPENSE' ? 'negative' : 'udhaar'}`}>
                    ₹{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="card-glass p-8 text-center text-muted">
            <p>{t('dashboard.no_transactions')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
