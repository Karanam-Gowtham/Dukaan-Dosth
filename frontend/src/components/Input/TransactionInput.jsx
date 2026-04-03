import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { aiAPI, transactionAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import VoiceRecorder from './VoiceRecorder';
import { FiSend, FiCheck, FiX, FiEdit, FiMic, FiType, FiPlus, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function TransactionInput() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('voice'); // voice, text, quick
  const [textInput, setTextInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSendText = async () => {
    if (!textInput.trim()) return;
    setParsing(true);
    try {
      const lang = i18n.language === 'te' ? 'te' : 'en';
      const res = await aiAPI.parse(textInput, lang);
      if (res.data.success) {
        setParsedData(res.data.parsed);
      } else {
        showToast(res.data.error || t('common.error'), 'error');
      }
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleVoiceSuccess = async (transcript) => {
    setTextInput(transcript);
    setParsing(true);
    try {
      const lang = i18n.language === 'te' ? 'te' : 'en';
      const res = await aiAPI.parse(transcript, lang);
      if (res.data.success) {
        setParsedData(res.data.parsed);
      } else {
        showToast(res.data.error || t('common.error'), 'error');
      }
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    setSaving(true);
    try {
      await transactionAPI.create(parsedData);
      showToast(t('input.saved_success'), 'success');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdd = (type, amount, desc) => {
    setParsedData({
      type,
      amount,
      description: desc,
      category: 'General',
      confidence: 1.0,
    });
  };

  return (
    <div className="page container">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gradient">{t('input.title')}</h2>
        <p className="text-secondary">{t('input.subtitle') || 'Speak or type your entry'}</p>
      </header>

      {/* Tab Selector - Premium Glass Bar */}
      <div className="card-glass mb-8 p-1 flex gap-1" style={{ borderRadius: '1rem' }}>
        {[
          { id: 'voice', icon: <FiMic />, label: t('input.voice_tab') },
          { id: 'text', icon: <FiType />, label: t('input.text_tab') },
          { id: 'quick', icon: <FiPlus />, label: t('input.quick_tab') }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-white'}`}
            onClick={() => { setActiveTab(tab.id); setParsedData(null); }}
          >
            {tab.icon} <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {/* Voice Tab */}
        {activeTab === 'voice' && !parsedData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 transition-all duration-500">
            <VoiceRecorder onResult={handleVoiceSuccess} isParsing={parsing} />
          </div>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && !parsedData && (
          <div className="card-glass p-6 animate-in fade-in slide-in-from-bottom-4 transition-all duration-500">
            <div className="input-group">
              <label className="input-label">{t('input.text_label', 'What happened?')}</label>
              <textarea 
                className="input mb-6" 
                rows="4" 
                placeholder={t('input.text_placeholder')}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                style={{ resize: 'none', fontSize: '1.1rem' }}
                disabled={parsing}
              />
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleSendText}
              disabled={parsing || !textInput.trim()}
            >
              {parsing ? <div className="loader-premium" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : <FiSend />}
              {parsing ? t('common.analyzing', 'Analyzing...') : t('input.send')}
            </button>
          </div>
        )}

        {/* Quick Tab */}
        {activeTab === 'quick' && !parsedData && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 transition-all duration-500">
            <button className="stat-card-premium success flex flex-col items-center gap-2 py-8" onClick={() => handleQuickAdd('SALE', 0, 'New Sale')}>
              <div className="text-3xl">💰</div>
              <div className="font-bold">{t('input.sale')}</div>
            </button>
            <button className="stat-card-premium danger flex flex-col items-center gap-2 py-8" onClick={() => handleQuickAdd('EXPENSE', 0, 'New Expense')}>
              <div className="text-3xl">🧾</div>
              <div className="font-bold">{t('input.expense')}</div>
            </button>
            <button className="stat-card-premium udhaar flex flex-col items-center gap-2 py-8" onClick={() => handleQuickAdd('CREDIT_GIVEN', 0, 'New Udhaar')}>
              <div className="text-3xl">👤</div>
              <div className="font-bold">{t('input.udhaar_given')}</div>
            </button>
            <button className="stat-card-premium flex flex-col items-center gap-2 py-8" onClick={() => handleQuickAdd('CREDIT_RECEIVED', 0, 'Udhaar Return')}>
              <div className="text-3xl">📥</div>
              <div className="font-bold">{t('input.udhaar_received')}</div>
            </button>
          </div>
        )}

        {/* Confirmation Card */}
        {parsedData && (
          <div className="card-glass p-0 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary/10 p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  parsedData.type === 'SALE' ? 'bg-success/20 text-success' : 
                  parsedData.type === 'EXPENSE' ? 'bg-danger/20 text-danger' : 'bg-udhaar/20 text-udhaar'
                }`}>
                  {parsedData.type.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2 text-warning text-sm">
                  <FiZap /> {Math.round(parsedData.confidence * 100)}% AI Accuracy
                </div>
              </div>
              
              <div className="mt-6 flex items-baseline justify-center gap-2">
                <span className="text-4xl font-black text-white">₹</span>
                <input 
                  type="number" 
                  className="bg-transparent text-6xl font-black text-white w-full text-center outline-none border-b-2 border-primary/30 focus:border-primary transition-all" 
                  value={parsedData.amount}
                  autoFocus
                  onChange={(e) => setParsedData({...parsedData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="input-group">
                <label className="input-label opacity-50">{t('input.description')}</label>
                <input 
                  className="input p-0 border-0 bg-transparent text-xl font-bold focus:shadow-none" 
                  value={parsedData.description}
                  onChange={(e) => setParsedData({...parsedData, description: e.target.value})}
                  placeholder="What was this for?"
                />
              </div>

              {parsedData.customer_name && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {parsedData.customer_name[0]}
                    </div>
                    <div>
                      <div className="text-xs text-muted">Customer / Name</div>
                      <div className="font-bold">{parsedData.customer_name}</div>
                    </div>
                  </div>
                  <FiEdit className="text-muted" />
                </div>
              )}

              {parsedData.clarification && (
                <div className="glass-panel text-warning text-sm flex gap-3">
                  <FiZap className="flex-shrink-0" />
                  <p>{parsedData.clarification}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button className="btn btn-outline flex-1" onClick={() => setParsedData(null)} disabled={saving}>
                  <FiX /> {t('input.confirm_cancel')}
                </button>
                <button className={`btn btn-primary flex-1 ${saving ? 'loading' : ''}`} onClick={handleSave} disabled={saving}>
                  {saving ? <div className="loader-premium" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : <FiCheck />}
                  {t('input.confirm_save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
