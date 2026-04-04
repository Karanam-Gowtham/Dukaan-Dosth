import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter,
  Download,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import api from '../../services/api';

const TransactionBadge = ({ type }) => {
    const styles = {
        SALE: "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20",
        EXPENSE: "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20",
        CREDIT_GIVEN: "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20",
        CREDIT_RECEIVED: "bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[type] || styles.SALE}`}>
            {type.replace('_', ' ')}
        </span>
    );
};

const HistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.transactions.getAll();
                setTransactions(res.data);
            } catch (err) {
                console.error("History Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return (
        <div className="page-wrapper flex items-center justify-center">
            <div className="loader-premium"></div>
        </div>
    );

    return (
        <div className="page-wrapper container app-container px-6 lg:px-0">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-1">Business Ledger</h1>
                    <p className="text-slate-400 text-sm font-medium">Detailed record of all transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn btn-outline btn-sm">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="btn btn-primary btn-sm">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Main Ledger Area */}
            <div className="card shadow-xl overflow-hidden p-0 border-slate-800 bg-slate-900/50 mb-10">
                
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
                    <Search size={18} className="text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search descriptions, amounts, customers..." 
                        className="bg-transparent border-none outline-none text-sm text-slate-100 flex-1"
                    />
                </div>

                {/* Table-like list */}
                <div className="divide-y divide-slate-800">
                    {transactions.length > 0 ? transactions.map((tx, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={tx.id} 
                            className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {tx.type === 'SALE' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-100 group-hover:text-white transition-colors">{tx.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <TransactionBadge type={tx.type} />
                                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                            <Calendar size={12} /> {new Date(tx.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                            <Clock size={12} /> {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <p className={`text-lg font-bold font-display ${tx.type === 'SALE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {tx.type === 'SALE' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tx.category || 'General'}</p>
                                </div>
                                <button className="p-2 text-slate-600 hover:text-slate-200 transition-colors">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                                <Clock size={32} />
                            </div>
                            <div>
                                <p className="text-slate-300 font-bold">No records found</p>
                                <p className="text-slate-500 text-sm">Start recording transactions to see them here.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination Placeholder */}
                <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span>Showing {transactions.length} entries</span>
                    <div className="flex items-center gap-2">
                        <span className="cursor-pointer hover:text-slate-300 text-indigo-500 underline">Previous</span>
                        <span className="cursor-pointer hover:text-slate-300 text-indigo-500 underline">Next</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
