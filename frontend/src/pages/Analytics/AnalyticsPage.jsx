import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiDownload, FiCpu, FiTrendingUp, FiTrendingDown, FiActivity, FiDollarSign, FiPercent, FiTarget, FiAlertCircle } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './Analytics.css';

const COLORS = ['#3730a3', '#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const [topMetrics, setTopMetrics] = useState({
    totalSales: 0,
    salesGrow: 0,
    totalExpenses: 0,
    expGrow: 0,
    grossProfit: 0,
    gpGrow: 0,
    netProfit: 0,
    npGrow: 0,
    profitMargin: 0,
    pmGrow: 0,
  });
  const [trendData, setTrendData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/analytics/profit-loss');
        const a = res.data?.data;
        if (!a || cancelled) return;
        const sales = Number(a.totalSales) || 0;
        const exp = Number(a.totalExpenses) || 0;
        const profit = Number(a.totalProfit) || 0;
        const margin = sales > 0 ? Math.round((profit / sales) * 1000) / 10 : 0;
        setTopMetrics({
          totalSales: sales,
          salesGrow: 0,
          totalExpenses: exp,
          expGrow: 0,
          grossProfit: profit,
          gpGrow: 0,
          netProfit: profit,
          npGrow: 0,
          profitMargin: margin,
          pmGrow: 0,
        });
        const trends = (a.dailyTrends || []).map((d, i) => {
          const dt = d.date ? new Date(d.date) : null;
          const label = dt
            ? dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
            : `D${i + 1}`;
          return {
            name: label,
            sales: Number(d.sales) || 0,
            expenses: Number(d.expenses) || 0,
            profit: Number(d.profit) || 0,
          };
        });
        setTrendData(trends.length ? trends : [{ name: '—', sales: 0, expenses: 0, profit: 0 }]);

        const ex = Number(a.totalExpenses) || 0;
        if (ex > 0) {
          setExpenseBreakdown([
            { name: 'Tracked expenses', value: ex, color: COLORS[0] },
            { name: 'Net margin', value: Math.max(0, Number(a.totalSales) - ex), color: COLORS[2] },
          ]);
        } else {
          setExpenseBreakdown([
            { name: 'Purchase', value: 1, color: COLORS[0] },
            { name: 'Other', value: 1, color: COLORS[2] },
          ]);
        }
      } catch {
        if (!cancelled) toast.error('Could not load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const csvRows = [
      ['Metric', 'Value', 'Growth'],
      ['Total Sales', topMetrics.totalSales, `${topMetrics.salesGrow}%`],
      ['Total Expenses', topMetrics.totalExpenses, `${topMetrics.expGrow}%`],
      ['Gross Profit', topMetrics.grossProfit, `${topMetrics.gpGrow}%`],
      ['Net Profit', topMetrics.netProfit, `${topMetrics.npGrow}%`],
      ['Profit Margin', `${topMetrics.profitMargin}%`, `${topMetrics.pmGrow}%`],
      [],
      ['Month', 'Sales', 'Expenses', 'Profit']
    ];
    
    trendData.forEach(t => csvRows.push([t.name, t.sales, t.expenses, t.profit]));

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dukaan_analytics_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Analytics Exported to CSV');
  };

  const categorySales = [
    { name: 'Grains', sales: 15000 },
    { name: 'Snacks', sales: 9500 },
    { name: 'Beverages', sales: 8200 },
    { name: 'Oil & Ghee', sales: 11000 },
    { name: 'Household', sales: 5050 }
  ];

  const topItems = [
    { name: 'Basmati Rice 5kg', category: 'Grains', sold: 42, revenue: 8400 },
    { name: 'Fortune Oil 1L', category: 'Oil', sold: 56, revenue: 6720 },
    { name: 'Lays Magic Masala', category: 'Snacks', sold: 120, revenue: 2400 },
    { name: 'Amul Taaza Milk', category: 'Beverages', sold: 95, revenue: 5700 },
    { name: 'Surf Excel 2kg', category: 'Household', sold: 25, revenue: 4500 }
  ];

  const cashFlowData = [
    { name: 'Week 1', cashIn: 12000, cashOut: 2000, net: 10000 },
    { name: 'Week 2', cashIn: 11500, cashOut: 2500, net: 9000 },
    { name: 'Week 3', cashIn: 14000, cashOut: 1800, net: 12200 },
    { name: 'Week 4', cashIn: 11250, cashOut: 2620, net: 8630 }
  ];

  const fmt = (v) => `₹${v.toLocaleString('en-IN')}`;

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="anx-tooltip">
          <p className="anx-t-date">{label}</p>
          {payload.map((p, i) => (
            <div key={i} className="anx-t-row">
              <div className="anx-t-dot" style={{ background: p.color }}></div>
              <span>{p.name}: <strong>{p.name.includes('Margin') || p.name === 'value' ? p.value : fmt(p.value)}</strong></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="anx-pos-layout">
      {/* HEADER OVERRIDE */}
      <div className="anx-header">
        <div className="anx-brand">
          <h1 className="anx-title">Dukaan Dost 🏪</h1>
          <span className="anx-tagline">Smart Billing, Happy Business</span>
        </div>
        
        <div className="anx-search-wrapper">
          <FiSearch className="anx-search-icon" />
          <input 
            type="text" 
            placeholder="Search bills, customers, items..."
            className="anx-search"
          />
        </div>

        <div className="anx-header-actions">
          <select className="anx-store-select">
            <option>Srinivas Kirana Store</option>
          </select>
          <button className="btn btn-outline" onClick={exportCSV}>
            <FiDownload /> Export
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/ai-insights')}>
            <FiCpu /> AI Insights
          </button>
        </div>
      </div>

      <div className="anx-main-content">
        {/* MAIN TITLE */}
        <div className="anx-page-title">
          <div>
            <h2>Data Analytics</h2>
            <p>Understand your business performance, profit & loss, and AI insights</p>
            {loading ? <p className="text-sm text-blue mt-2 font-medium">Syncing last 7 days from your shop…</p> : null}
          </div>
        </div>

        {/* TOP METRIC CARDS */}
        <div className="anx-top-cards">
          <div className="anx-card metric-card">
            <div className="mc-head">
              <div className="mc-icon bg-blue-subtle text-blue"><FiTrendingUp /></div>
              <span className={`mc-grow ${topMetrics.salesGrow > 0 ? 'text-green' : 'text-red'}`}>
                {topMetrics.salesGrow}% ↑
              </span>
            </div>
            <span className="mc-label">Total Sales</span>
            <span className="mc-value">{fmt(topMetrics.totalSales)}</span>
          </div>

          <div className="anx-card metric-card">
            <div className="mc-head">
              <div className="mc-icon bg-red-subtle text-red"><FiTrendingDown /></div>
              <span className={`mc-grow text-red`}>
                {Math.abs(topMetrics.expGrow)}% ↑ Dues
              </span>
            </div>
            <span className="mc-label">Total Expenses</span>
            <span className="mc-value">{fmt(topMetrics.totalExpenses)}</span>
          </div>

          <div className="anx-card metric-card">
            <div className="mc-head">
              <div className="mc-icon bg-green-subtle text-green"><FiActivity /></div>
              <span className={`mc-grow text-green`}>
                {topMetrics.gpGrow}% ↑
              </span>
            </div>
            <span className="mc-label">Gross Profit</span>
            <span className="mc-value">{fmt(topMetrics.grossProfit)}</span>
          </div>

          <div className="anx-card metric-card highlight">
            <div className="mc-head">
              <div className="mc-icon text-white"><FiDollarSign /></div>
              <span className={`mc-grow text-white`}>
                +{topMetrics.npGrow}%
              </span>
            </div>
            <span className="mc-label text-white">Net Profit</span>
            <span className="mc-value text-white">{fmt(topMetrics.netProfit)}</span>
          </div>

          <div className="anx-card metric-card">
            <div className="mc-head">
              <div className="mc-icon bg-orange-subtle text-orange"><FiPercent /></div>
              <span className={`mc-grow text-green`}>
                +{topMetrics.pmGrow}%
              </span>
            </div>
            <span className="mc-label">Profit Margin</span>
            <span className="mc-value">{topMetrics.profitMargin}%</span>
          </div>
        </div>

        {/* CHART SECTION: ROW 1 */}
        <div className="anx-grid row-1">
          {/* L1: Sales vs Expenses */}
          <div className="anx-card chart-card">
            <h3 className="chart-title">Sales vs Expenses</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Area type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* C1: Profit Trend */}
          <div className="anx-card chart-card">
            <h3 className="chart-title">Profit Trend</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* R1: Expense Breakdown Pie */}
          <div className="anx-card chart-card">
            <h3 className="chart-title">Expense Breakdown</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHART SECTION: ROW 2 */}
        <div className="anx-grid row-2">
          {/* L2: Category-wise Sales Bar Chart */}
          <div className="anx-card chart-card">
            <h3 className="chart-title">Category-wise Sales</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySales} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text)' }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="sales" name="Revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* C2: Top Selling Items Table */}
          <div className="anx-card table-card">
            <div className="card-header-flex">
              <h3 className="chart-title">Top Selling Items</h3>
              <button className="btn-link">View All</button>
            </div>
            <div className="anx-table-wrap">
              <table className="anx-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th className="text-right">Sold</th>
                    <th className="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((ti, i) => (
                    <tr key={i}>
                      <td className="font-medium text-dark">{ti.name}</td>
                      <td><span className="anx-badge">{ti.category}</span></td>
                      <td className="text-right font-medium">{ti.sold}</td>
                      <td className="text-right text-blue font-bold">{fmt(ti.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* R2: AI Insights Panel */}
          <div className="anx-card ai-card">
            <div className="ai-header">
              <div className="ai-icon-pulse"><FiCpu /></div>
              <h3 className="chart-title">AI Insights</h3>
            </div>
            <div className="ai-list">
              <div className="ai-item success">
                <div className="ai-dot"></div>
                <p><strong>Profit increased by 18%</strong> compared to the last period primarily due to volume sales.</p>
              </div>
              <div className="ai-item warning">
                <div className="ai-dot"></div>
                <p><strong>Expenses are higher this month</strong>, primarily driven by Stock Purchases.</p>
              </div>
              <div className="ai-item info">
                <div className="ai-dot"></div>
                <p><strong>Snacks sales are growing fast</strong>. Consider increasing inventory buffer.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: ROW 3 */}
        <div className="anx-grid row-3">
          {/* L3: Profit & Loss Summary */}
          <div className="anx-card pl-card">
            <h3 className="chart-title mb-4">Profit & Loss Summary</h3>
            <div className="pl-list">
              <div className="pl-row">
                <span className="pl-label">Total Sales</span>
                <span className="pl-val text-blue">{fmt(topMetrics.totalSales)}</span>
              </div>
              <div className="pl-row">
                <span className="pl-label">Total Expenses</span>
                <span className="pl-val text-red">-{fmt(topMetrics.totalExpenses)}</span>
              </div>
              <div className="pl-row border-top">
                <span className="pl-label">Gross Profit</span>
                <span className="pl-val font-semibold">{fmt(topMetrics.grossProfit)}</span>
              </div>
              <div className="pl-row highlight-pl">
                <span className="pl-label text-dark font-bold">Net Profit</span>
                <span className="pl-val text-green font-bold text-lg">{fmt(topMetrics.netProfit)}</span>
              </div>
            </div>
          </div>

          {/* C3: Cash Flow Overview */}
          <div className="anx-card chart-card">
            <h3 className="chart-title">Cash Flow Overview</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="cashIn" name="Cash In" fill="#10b981" radius={[2, 2, 0, 0]} barSize={12} />
                  <Bar dataKey="cashOut" name="Cash Out" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={12} />
                  <Bar dataKey="net" name="Net Cash Flow" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* R3: AI Forecast Panel */}
          <div className="anx-card forecast-card">
            <h3 className="chart-title"><FiTarget className="mr-2 inline" /> AI Forecast Panel</h3>
            <p className="fc-desc">Based on historical data, here are the projections for next month:</p>
            
            <div className="fc-metrics">
              <div className="fc-box">
                <span className="fc-label">Expected Sales</span>
                <span className="fc-val text-blue">₹55k - ₹58k</span>
              </div>
              <div className="fc-box">
                <span className="fc-label">Expected Profit</span>
                <span className="fc-val text-green">₹32k - ₹35k</span>
              </div>
              <div className="fc-box highlight">
                <span className="fc-label">Growth Prediction</span>
                <span className="fc-val text-white">+10–15%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
