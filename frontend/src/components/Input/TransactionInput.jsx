import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { aiAPI, transactionAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import VoiceRecorder from './VoiceRecorder';
import { FiSend, FiCheck, FiX, FiEdit, FiMic, FiType, FiPlus } from 'react-icons/fi';
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
      const res = await aiAPI.parse(textInput, i18n.language);
      setParsedData(res.data.parsed);
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
      const res = await aiAPI.parse(transcript, i18n.language);
      setParsedData(res.data.parsed);
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
      navigate('/');
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
      category: 'general',
      confidence: 1.0,
    });
  };

  return (
    <div className="transaction-input-page page">
      <header className="mb-6">
        <h2 className="text-xl font-bold">{t('input.title')}</h2>
        <p className="text-muted">{t('input.subtitle') || 'Speak or type your entry'}</p>
      </header>

      {/* Tab Selector */}
      <div className="tab-bar mb-6">
        <button 
          className={`tab-item ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          <FiMic /> {t('input.voice_tab')}
        </button>
        <button 
          className={`tab-item ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <FiType /> {t('input.text_tab')}
        </button>
        <button 
          className={`tab-item ${activeTab === 'quick' ? 'active' : ''}`}
          onClick={() => setActiveTab('quick')}
        >
          <FiPlus /> {t('input.quick_tab')}
        </button>
      </div>

      <div className="transaction-container">
        {/* Voice Tab */}
        {activeTab === 'voice' && !parsedData && (
          <VoiceRecorder onResult={handleVoiceSuccess} isParsing={parsing} />
        )}

        {/* Text Tab */}
        {activeTab === 'text' && !parsedData && (
          <div className="text-input-container card-glass">
            <textarea 
              className="input mb-4" 
              rows="3" 
              placeholder={t('input.text_placeholder')}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={parsing}
            />
            <button 
              className={`btn btn-primary btn-block ${parsing ? 'loading' : ''}`}
              onClick={handleSendText}
              disabled={parsing || !textInput.trim()}
            >
              <FiSend /> {t('input.send')}
            </button>
          </div>
        )}

        {/* Quick Tab */}
        {activeTab === 'quick' && !parsedData && (
          <div className="quick-actions grid-cols-2">
            <button className="quick-btn" onClick={() => handleQuickAdd('SALE', 0, 'Sale')}>
              <div className="quick-btn-icon text-success">💰</div>
              <div className="quick-btn-label">{t('input.sale')}</div>
            </button>
            <button className="quick-btn" onClick={() => handleQuickAdd('EXPENSE', 0, 'Expense')}>
              <div className="quick-btn-icon text-danger">📉</div>
              <div className="quick-btn-label">{t('input.expense')}</div>
            </button>
            <button className="quick-btn" onClick={() => handleQuickAdd('CREDIT_GIVEN', 0, 'Udhaar')}>
              <div className="quick-btn-icon text-udhaar">🤝</div>
              <div className="quick-btn-label">{t('input.udhaar_given')}</div>
            </button>
          </div>
        )}

        {/* Confirmation Card (Shared by all tabs) */}
        {parsedData && (
          <div className="confirm-card">
            <div className="confirm-card-header">
              <span className={`badge badge-${parsedData.type.toLowerCase().replace('_', '-')}`}>
                {t(`input.${parsedData.type.toLowerCase()}`)}
              </span>
              <div className="confirm-card-type">{t(`input.${parsedData.type.toLowerCase()}`)}</div>
            </div>

            <div className="confirm-amount">
              ₹<input 
                type="number" 
                className="amount-edit-input" 
                value={parsedData.amount}
                onChange={(e) => setParsedData({...parsedData, amount: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="confirm-card-details">
              <div className="confirm-row">
                <span className="confirm-label">{t('input.description')}</span>
                <input 
                  className="confirm-value-input" 
                  value={parsedData.description}
                  onChange={(e) => setParsedData({...parsedData, description: e.target.value})}
                />
              </div>
              {parsedData.customer_name && (
                <div className="confirm-row">
                  <span className="confirm-label">{t('input.customer_name')}</span>
                  <span className="confirm-value">{parsedData.customer_name}</span>
                </div>
              )}
              {parsedData.clarification && (
                <div className="ai-clarification mt-4 p-3 bg-warning-bg text-warning text-sm rounded-md">
                  💡 {parsedData.clarification}
                </div>
              )}
            </div>

            <div className="confirm-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setParsedData(null)}
                disabled={saving}
              >
                <FiX /> {t('input.confirm_cancel')}
              </button>
              <button 
                className={`btn btn-primary ${saving ? 'loading' : ''}`} 
                onClick={handleSave}
                disabled={saving}
              >
                <FiCheck /> {t('input.confirm_save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
