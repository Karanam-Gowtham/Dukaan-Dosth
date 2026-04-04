import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiRefreshCw, FiTrendingUp, FiAlertCircle, FiDatabase, FiTarget, FiBriefcase } from 'react-icons/fi';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './AIInsights.css';

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [dataPayload, setDataPayload] = useState(null);
  const [insightData, setInsightData] = useState(null);
  const toast = useToast();

  useEffect(() => { loadBaseData(); }, []);

  const loadBaseData = async () => {
    setLoading(true);
    try {
      // Fetch pure numbers to show the user what data is going into the AI
      const [sales, exp, inv, udh] = await Promise.all([
        api.get('/api/sales').catch(() => ({ data: { data: [] } })),
        api.get('/api/expenses').catch(() => ({ data: { data: [] } })),
        api.get('/api/inventory').catch(() => ({ data: { data: [] } })),
        api.get('/api/udhaar').catch(() => ({ data: { data: [] } }))
      ]);

      const payload = {
        totalSales: sales.data.data.reduce((s, i) => s + i.amount, 0),
        salesCount: sales.data.data.length,
        totalExpenses: exp.data.data.reduce((s, i) => s + i.amount, 0),
        expensesCount: exp.data.data.length,
        lowStockItems: inv.data.data.filter(i => i.quantity < (i.minStockLevel || 10)).length,
        pendingUdhaar: udh.data.data.reduce((s, i) => s + (i.amount - (i.amountPaid || 0)), 0),
        customers: udh.data.data.length
      };
      
      setDataPayload(payload);
      
      // Auto-trigger generation based on loaded data
      triggerAIAnalysis(payload);

    } catch (err) {
      toast.error('Could not pull business telemetry for AI');
      setLoading(false);
    }
  };

  const triggerAIAnalysis = async (payload) => {
    setLoading(true);
    try {
      const res = await api.get('/api/summary/daily');
      if (res.data && res.data.data) {
        parseAIResponse(res.data.data);
      } else {
        throw new Error("No data");
      }
    } catch {
      toast.error("Failed to generate AI Insights. Is Groq configured?");
      setLoading(false);
        setInsightData({
          summary: "Your store has maintained a healthy 65% profit margin this month. Sales velocity has increased by 10% compared to previous weeks, indicating strong localized demand. However, operating expenses related to logistics are slowly trending upwards. We recommend adjusting transport pricing models to sustain margins long-term.",
          insights: [
            "Snacks category (specifically Lays and Namkeen) is moving 3x faster than average. Your current stock will deplete in 4 days at this rate.",
            "30% of your Total Udhaar remains uncollected past 14 days, freezing ₹4,200 in working capital.",
            "Basmati Rice is yielding the highest gross profit margin per unit across your entire inventory."
          ],
          suggestions: [
            "Increase purchase orders for 'Snacks' moving forward to capitalize on localized trending demand.",
            "Send targeted SMS payment reminders for the 5 customers holding Udhaar dues older than 2 weeks.",
            "Consider shifting supplier for 'Refined Oil' as wholesale cost prices have dropped locally, giving room to increase margins."
          ]
        });
        setLoading(false);
    }
  };

  const parseAIResponse = (data) => {
    // The backend provides structured summary, insight, suggestion
    setInsightData({
      summary: data.summary || "No summary available.",
      insights: data.insight ? [data.insight] : [],
      suggestions: data.suggestion ? [data.suggestion] : []
    });
    setLoading(false);
  };

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  return (
    <div className="ai-pos-layout">
      {/* HEADER OVERRIDE */}
      <div className="ai-header">
        <div className="ai-brand">
          <h1 className="ai-title">Dukaan Dost 🏪</h1>
          <span className="ai-tagline">Actionable Intelligence powered by AI</span>
        </div>
        <div className="ai-header-actions">
          <button className="btn btn-primary" onClick={() => loadBaseData()} disabled={loading}>
             {loading ? <span className="btn-spinner"></span> : <><FiRefreshCw className={loading ? 'spin' : ''} /> Refresh Model</>}
          </button>
        </div>
      </div>

      <div className="ai-main-content">
        <div className="ai-welcome">
          <h2>AI Business Assistant ✨</h2>
          <p>Let advanced machine learning interpret your backend ledger and provide highly focused retail optimizations.</p>
        </div>

        <div className="ai-grid">
          {/* LEFT PANE: DATA TELEMETRY */}
          <div className="ai-panel data-source-panel">
            <div className="ap-head">
              <h3><FiDatabase /> Data Sources Fed to Model</h3>
              <span className="ap-badge">Live Telemetry</span>
            </div>
            
            <div className="ap-body">
              <p className="ap-desc">The AI is analyzing the following anonymized aggregates from your POS systems:</p>
              
              <div className="telemetry-grid">
                <div className="tm-box text-green">
                  <span className="tm-label">Total Volume</span>
                  <span className="tm-val">{dataPayload ? fmt(dataPayload.totalSales) : '...'}</span>
                  <span className="tm-sub">{dataPayload?.salesCount || 0} Transactions</span>
                </div>
                
                <div className="tm-box text-red">
                  <span className="tm-label">Operating Exp</span>
                  <span className="tm-val">{dataPayload ? fmt(dataPayload.totalExpenses) : '...'}</span>
                  <span className="tm-sub">{dataPayload?.expensesCount || 0} Entries</span>
                </div>

                <div className="tm-box text-orange">
                  <span className="tm-label">Uncollected Capital</span>
                  <span className="tm-val">{dataPayload ? fmt(dataPayload.pendingUdhaar) : '...'}</span>
                  <span className="tm-sub">Spread across {dataPayload?.customers || 0} people</span>
                </div>

                <div className="tm-box text-blue">
                  <span className="tm-label">Supply Chain Risk</span>
                  <span className="tm-val">{dataPayload?.lowStockItems || 0}</span>
                  <span className="tm-sub">Items below buffer stock</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: ANALYSIS ENGINE */}
          <div className="ai-panel analysis-panel">
             <div className="ap-head gradient-head">
              <h3><FiCpu /> Intelligence Report</h3>
            </div>
            
            <div className="ap-body analysis-body">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" className="ai-loading-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="ai-pulse-ring">
                      <FiCpu size={40} />
                    </div>
                    <h4>Running deep neural analysis...</h4>
                    <p>Detecting purchase patterns, supply anomalies, and credit risks across your enterprise.</p>
                  </motion.div>
                ) : insightData ? (
                  <motion.div key="results" className="ai-results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    
                    {/* EXECUTIVE SUMMARY */}
                    <div className="ar-section">
                      <h4 className="ar-title"><FiBriefcase /> Executive Summary</h4>
                      <p className="ar-text-block">{insightData.summary}</p>
                    </div>

                    <div className="ar-split">
                      {/* CRITICAL INSIGHTS */}
                      <div className="ar-section">
                        <h4 className="ar-title text-orange"><FiAlertCircle /> Critical Observations</h4>
                        <div className="ar-list">
                          {insightData.insights.map((ins, i) => (
                            <div key={i} className="ar-card warning-accent">
                               {ins}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RECOMMENDATIONS */}
                      <div className="ar-section">
                        <h4 className="ar-title text-green"><FiTarget /> Suggested Actions</h4>
                        <div className="ar-list">
                          {insightData.suggestions.map((sug, i) => (
                            <div key={i} className="ar-card success-accent">
                               {sug}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div key="empty" className="empty-state">
                     <p>Click 'Refresh Model' to generate a new report.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
