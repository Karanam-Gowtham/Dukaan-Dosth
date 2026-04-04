import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMic,
  FiMicOff,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiFileText,
  FiArrowRight,
} from 'react-icons/fi';
import api from '../../api/axios';
import { unwrapData, mapExpenseCategory } from '../../api/apiHelpers';
import { useToast } from '../../context/ToastContext';

const TransactionInput = () => {
  const toast = useToast();
  const [mode, setMode] = useState('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [manualData, setManualData] = useState({
    amount: '',
    description: '',
    type: 'SALE',
    category: 'OTHER',
    customerName: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const recognitionRef = useRef(null);

  const handleAIParse = useCallback(async (text) => {
    if (!text?.trim()) return;
    setLoading(true);
    setParsedData(null);
    try {
      const res = await api.post('/api/ai/parse', {
        rawInput: text.trim(),
        language: 'en',
      });
      const parsed = unwrapData(res);
      if (!parsed || parsed.amount == null || Number(parsed.amount) <= 0) {
        toast.error('Could not detect a valid amount. Try manual entry.');
        setParsedData(null);
        return;
      }
      setParsedData(parsed);
    } catch {
      toast.error('AI parse failed. Try manual entry or check your connection.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'te-IN,en-IN';

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      handleAIParse(result);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => {
      setIsRecording(false);
      toast.error('Speech recognition error');
    };
    recognitionRef.current = recognition;
  }, [handleAIParse, toast]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setParsedData(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const applyCreditReceived = async (amount, customerHint) => {
    const res = await api.get('/api/udhaar/all');
    const list = unwrapData(res) || [];
    const hint = (customerHint || '').trim().toLowerCase();
    const candidates = list.filter((u) => {
      const pending = Number(u.pendingAmount ?? u.totalAmount - (u.paidAmount || 0));
      return pending > 0;
    });
    let match = null;
    if (hint) {
      match = candidates.find((u) => (u.customerName || '').toLowerCase().includes(hint));
    }
    if (!match && candidates.length === 1) match = candidates[0];
    if (!match) {
      throw new Error(
        hint
          ? 'No open udhaar matches that customer. Record payment from the Udhaar page.'
          : 'Open the Udhaar page to record payment against the right customer.',
      );
    }
    await api.post(`/api/udhaar/${match.id}/payment`, {
      amount,
      note: 'Recorded from Quick Add',
    });
  };

  const handleConfirm = async () => {
    const source = parsedData || {
      type: manualData.type,
      amount: parseFloat(manualData.amount),
      description: manualData.description,
      category: manualData.category,
      customerName: manualData.customerName,
    };

    const amount = Number(source.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid positive amount.');
      return;
    }

    const desc = (source.description || '').trim() || 'Transaction';
    const type = source.type || 'SALE';

    setLoading(true);
    try {
      if (type === 'SALE') {
        await api.post('/api/sales', { amount, description: desc });
      } else if (type === 'EXPENSE') {
        await api.post('/api/expenses', {
          amount,
          description: desc,
          category: mapExpenseCategory(source.category || manualData.category),
        });
      } else if (type === 'CREDIT_GIVEN') {
        const name = (source.customerName || manualData.customerName || '').trim() || 'Customer';
        await api.post('/api/udhaar', {
          customerName: name,
          customerPhone: '',
          totalAmount: amount,
          description: desc,
        });
      } else if (type === 'CREDIT_RECEIVED') {
        await applyCreditReceived(amount, source.customerName || manualData.customerName);
      } else {
        await api.post('/api/sales', { amount, description: desc });
      }

      setStatus({ type: 'success', message: 'Transaction recorded successfully!' });
      toast.success('Saved');
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      setParsedData(null);
      setTranscript('');
      setManualData({
        amount: '',
        description: '',
        type: 'SALE',
        category: 'OTHER',
        customerName: '',
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to save.';
      setStatus({ type: 'error', message: msg });
      toast.error(typeof msg === 'string' ? msg : 'Failed to record transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper container app-container">
      <div className="mb-8 p-6 lg:p-0">
        <h1 className="text-3xl font-display font-bold mb-2">New Transaction</h1>
        <p className="text-slate-400 text-sm font-medium">Record a sale, expense, or udhaar.</p>
      </div>

      <div className="mx-6 lg:mx-0 flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-slate-800">
        <button
          type="button"
          onClick={() => setMode('voice')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'voice' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          <FiMic size={16} /> AI Voice
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'manual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          <FiFileText size={16} /> Manual
        </button>
      </div>

      <div className="px-6 lg:px-0 pb-10">
        <AnimatePresence mode="wait">
          {mode === 'voice' ? (
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  {isRecording && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-indigo-600/20 rounded-full blur-2xl"
                    />
                  )}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 shadow-rose-500/30' : 'bg-indigo-600 shadow-indigo-600/30'} shadow-2xl relative z-10`}
                  >
                    {isRecording ? <FiMicOff size={32} /> : <FiMic size={32} />}
                  </button>
                </div>
                <p className="mt-6 text-sm font-bold text-slate-400 tracking-wide uppercase">
                  {isRecording ? 'Listening...' : 'Tap to speak in Telugu or English'}
                </p>
              </div>

              {transcript ? (
                <div className="card border-slate-800/50 bg-slate-900/40 italic text-slate-300 py-4 px-6 text-center">
                  &ldquo;{transcript}&rdquo;
                </div>
              ) : null}

              {loading && !parsedData ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <FiLoader className="animate-spin text-indigo-500" size={32} />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processing...</p>
                </div>
              ) : null}

              {parsedData ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card border-indigo-500/30 bg-indigo-500/5 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-6 border-b border-indigo-500/20 pb-4">
                    <FiCheckCircle size={24} className="text-emerald-500" />
                    <h3 className="text-lg font-bold">Transaction Decoded</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="stat-widget">
                      <span className="stat-label">Amount</span>
                      <p className="text-xl font-bold text-white">₹{parsedData.amount}</p>
                    </div>
                    <div className="stat-widget">
                      <span className="stat-label">Type</span>
                      <p className="text-xl font-bold text-indigo-400 uppercase text-xs">{parsedData.type}</p>
                    </div>
                    <div className="stat-widget col-span-2">
                      <span className="stat-label">Description</span>
                      <p className="text-sm font-medium text-slate-200">{parsedData.description}</p>
                    </div>
                    {parsedData.customerName ? (
                      <div className="stat-widget col-span-2">
                        <span className="stat-label">Customer</span>
                        <p className="text-sm font-medium text-slate-200">{parsedData.customerName}</p>
                      </div>
                    ) : null}
                  </div>
                  <button type="button" onClick={handleConfirm} className="btn btn-primary w-full" disabled={loading}>
                    {loading ? 'Confirming...' : 'Confirm & Save'} <FiArrowRight size={18} className="ml-2" />
                  </button>
                </motion.div>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card shadow-xl space-y-5"
            >
              <div className="form-group">
                <label className="label">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-pro text-2xl font-display font-bold text-emerald-500"
                  placeholder="0.00"
                  value={manualData.amount}
                  onChange={(e) => setManualData({ ...manualData, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <input
                  className="input-pro"
                  placeholder="e.g. Sales of Rice"
                  value={manualData.description}
                  onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Type</label>
                  <select
                    className="input-pro text-sm"
                    value={manualData.type}
                    onChange={(e) => setManualData({ ...manualData, type: e.target.value })}
                  >
                    <option value="SALE">Sale (+)</option>
                    <option value="EXPENSE">Expense (-)</option>
                    <option value="CREDIT_GIVEN">Udhaar / Credit given</option>
                    <option value="CREDIT_RECEIVED">Payment received</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Expense category</label>
                  <select
                    className="input-pro text-sm"
                    value={manualData.category}
                    onChange={(e) => setManualData({ ...manualData, category: e.target.value })}
                    disabled={manualData.type !== 'EXPENSE'}
                  >
                    <option value="OTHER">Other</option>
                    <option value="RENT">Rent</option>
                    <option value="ELECTRICITY">Electricity</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="PURCHASE">Purchase</option>
                    <option value="SALARY">Salary</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="PACKAGING">Packaging</option>
                  </select>
                </div>
              </div>
              {(manualData.type === 'CREDIT_GIVEN' || manualData.type === 'CREDIT_RECEIVED') && (
                <div className="form-group">
                  <label className="label">Customer name</label>
                  <input
                    className="input-pro"
                    placeholder="Customer name"
                    value={manualData.customerName}
                    onChange={(e) => setManualData({ ...manualData, customerName: e.target.value })}
                  />
                </div>
              )}
              <button type="button" onClick={handleConfirm} className="btn btn-primary w-full h-12" disabled={loading}>
                {loading ? 'Recording...' : 'Save Transaction'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status.message ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-24 left-4 right-4 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 ${status.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}
        >
          {status.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
          <span className="font-bold">{status.message}</span>
        </motion.div>
      ) : null}
    </div>
  );
};

export default TransactionInput;
