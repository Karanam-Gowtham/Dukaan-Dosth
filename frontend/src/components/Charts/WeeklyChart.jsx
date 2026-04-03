import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dashboardAPI, aiAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, ReferenceLine 
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiPieChart, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export default function WeeklyChart() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [weeklyData, setWeeklyData] = useState([]);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getWeekly();
      setWeeklyData(res.data || []);
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await aiAPI.getWeeklyInsight(weeklyData);
      setInsight(res.data.insight);
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setInsightLoading(false);
    }
  };

  // Calculate weekly stats
  const totalSales = weeklyData.reduce((sum, d) => sum + d.totalSales, 0);
  const totalProfit = weeklyData.reduce((sum, d) => sum + d.netProfit, 0);
  const bestDay = [...weeklyData].sort((a,b) => b.netProfit - a.netProfit)[0];

  if (loading) {
    return (
      <div className="charts-skeleton page">
        <div className="skeleton-card skeleton mb-6" style={{ height: '300px' }}></div>
        <div className="skeleton-text skeleton mb-6" style={{ height: '100px' }}></div>
      </div>
    );
  }

  return (
    <div className="weekly-chart-page">
      <header className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('charts.title')}</h2>
      </header>

      {/* Chart Container */}
      <div className="chart-container card-glass mb-8 p-4">
        <h3 className="text-sm font-bold text-muted mb-4">{t('charts.weekly_chart')}</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A0AEC0', fontSize: 10 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString([], {weekday: 'short'})}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A0AEC0', fontSize: 10 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#1A202C', 
                  borderColor: '#2D3748', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <ReferenceLine y={0} stroke="#4A5568" />
              <Bar dataKey="netProfit" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.netProfit >= 0 ? '#48BB78' : '#F56565'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Weekly Stats */}
      <div className="quick-actions grid-cols-2 mb-8">
        <div className="stat-card">
          <div className="stat-label">{t('charts.total_week')}</div>
          <div className="stat-value text-primary">₹{totalSales.toLocaleString()}</div>
          <div className="stat-icon mt-2"><FiPieChart /></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('charts.best_day')}</div>
          <div className="stat-value text-success">
            {bestDay ? new Date(bestDay.date).toLocaleDateString([], {weekday: 'short'}) : 'N/A'}
          </div>
          <div className="stat-icon mt-2 text-success"><FiTrendingUp /></div>
        </div>
      </div>

      {/* AI Weekly Insight Section */}
      <section className="mb-8">
        <div className="section-header flex justify-between items-center mb-4">
          <h3 className="font-bold">{t('charts.ai_insight')}</h3>
          {!insight && (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleGenerateInsight}
              disabled={insightLoading}
            >
              {insightLoading ? t('common.loading') : t('charts.generate_insight')}
            </button>
          )}
        </div>
        
        {insight ? (
          <div className="ai-summary">
            <div className="ai-summary-title">📈 {t('charts.ai_insight')}</div>
            <p className="ai-summary-text">{insight}</p>
          </div>
        ) : (
          <div className="card-glass p-8 text-center text-muted">
            {insightLoading ? t('common.loading') : 'No insights yet'}
          </div>
        )}
      </section>
    </div>
  );
}
