import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiMoreVertical,
  FiClock,
  FiUsers,
  FiDollarSign,
} from 'react-icons/fi';
import api from '../../api/axios';
import { unwrapData } from '../../api/apiHelpers';
import { useToast } from '../../context/ToastContext';

const TransactionBadge = ({ type }) => {
  const styles = {
    SALE: 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20',
    EXPENSE: 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20',
    CREDIT_GIVEN: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20',
    CREDIT_RECEIVED: 'bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20',
  };
  const label = (type || 'SALE').replace(/_/g, ' ');
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[type] || styles.SALE}`}
    >
      {label}
    </span>
  );
};

const typeIcon = (type) => {
  if (type === 'SALE') return <FiArrowUpRight size={20} />;
  if (type === 'EXPENSE') return <FiArrowDownLeft size={20} />;
  if (type === 'CREDIT_RECEIVED') return <FiDollarSign size={20} />;
  if (type === 'CREDIT_GIVEN') return <FiUsers size={20} />;
  return <FiTrendingUp size={20} />;
};

const typeIconClass = (type) => {
  if (type === 'SALE' || type === 'CREDIT_RECEIVED') return 'bg-emerald-500/10 text-emerald-500';
  if (type === 'EXPENSE') return 'bg-rose-500/10 text-rose-500';
  return 'bg-amber-500/10 text-amber-500';
};

const HistoryPage = () => {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/ledger', { params: { limit: 1000 } });
        const rows = unwrapData(res) || [];
        setTransactions(Array.isArray(rows) ? rows : []);
      } catch {
        toast.error('Could not load ledger');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      if (!q) return true;
      const hay = [
        tx.description,
        tx.category,
        tx.customerName,
        String(tx.amount),
        tx.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [transactions, search, typeFilter]);

  const exportCsv = () => {
    const rows = [
      ['Date', 'Type', 'Amount', 'Description', 'Category', 'Customer'].join(','),
      ...filtered.map((tx) => {
        const d = tx.createdAt ? new Date(tx.createdAt).toISOString() : '';
        const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
        return [
          esc(d),
          esc(tx.type),
          esc(tx.amount),
          esc(tx.description),
          esc(tx.category),
          esc(tx.customerName),
        ].join(',');
      }),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dukaan_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Ledger exported');
  };

  if (loading)
    return (
      <div className="page-wrapper flex items-center justify-center">
        <div className="loader-premium"></div>
      </div>
    );

  return (
    <div className="page-wrapper container app-container px-6 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Business Ledger</h1>
          <p className="text-slate-400 text-sm font-medium">Sales, expenses, and udhaar in one timeline</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-1">
            <FiFilter size={16} className="text-slate-500" />
            <select
              className="bg-transparent text-xs font-bold text-slate-200 outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All types</option>
              <option value="SALE">Sales</option>
              <option value="EXPENSE">Expenses</option>
              <option value="CREDIT_GIVEN">Credit given</option>
              <option value="CREDIT_RECEIVED">Credit received</option>
            </select>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={exportCsv}>
            <FiDownload size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card shadow-xl overflow-hidden p-0 border-slate-800 bg-slate-900/50 mb-10">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <FiSearch size={18} className="text-slate-500 shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search descriptions, amounts, customers..."
            className="bg-transparent border-none outline-none text-sm text-slate-100 flex-1 min-w-0"
          />
        </div>

        <div className="divide-y divide-slate-800">
          {filtered.length > 0 ? (
            filtered.map((tx, idx) => {
              const isOutflow = tx.type === 'EXPENSE' || tx.type === 'CREDIT_GIVEN';
              const signed = isOutflow ? -Math.abs(Number(tx.amount) || 0) : Math.abs(Number(tx.amount) || 0);
              const dt = tx.createdAt ? new Date(tx.createdAt) : null;
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.6) }}
                  key={tx.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between group gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeIconClass(tx.type)}`}
                    >
                      {typeIcon(tx.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                        {tx.description || '—'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <TransactionBadge type={tx.type} />
                        {tx.customerName ? (
                          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                            {tx.customerName}
                          </span>
                        ) : null}
                        {dt ? (
                          <>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                              <FiCalendar size={12} /> {dt.toLocaleDateString()}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                              <FiClock size={12} />{' '}
                              {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4 shrink-0">
                    <div>
                      <p
                        className={`text-lg font-bold font-display ${signed >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                      >
                        {signed >= 0 ? '+' : ''}₹{Math.abs(signed).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {tx.category || 'General'}
                      </p>
                    </div>
                    <button type="button" className="p-2 text-slate-600 hover:text-slate-200 transition-colors hidden sm:block" aria-label="More">
                      <FiMoreVertical size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <FiClock size={32} />
              </div>
              <div>
                <p className="text-slate-300 font-bold">No records found</p>
                <p className="text-slate-500 text-sm">Try another filter or record a sale or expense.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-bold">
          <span>
            Showing {filtered.length} of {transactions.length} entries
          </span>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
