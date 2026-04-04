import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiPhone, FiFilter, FiChevronDown, FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight, FiUsers, FiDollarSign, FiSmartphone, FiCreditCard } from 'react-icons/fi';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './Udhaar.css';

const TABS = ['All Customers', 'Pending', 'Partially Paid', 'Fully Paid'];

export default function UdhaarPage() {
  const toast = useToast();
  const [udhaarData, setUdhaarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All Customers');
  const [sortBy, setSortBy] = useState('Highest Pending');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newUdhaarAmt, setNewUdhaarAmt] = useState('');
  const [newUdhaarDesc, setNewUdhaarDesc] = useState('');

  useEffect(() => { loadUdhaar(); }, []);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentUdhaarId, setPaymentUdhaarId] = useState(null);

  const openPaymentModal = (u, e) => {
    if (e) e.stopPropagation();
    setPaymentUdhaarId(u.id);
    setPaymentModalOpen(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/api/udhaar/${paymentUdhaarId}/payment`, {
        amount: parseFloat(paymentAmount),
        note: paymentNote
      });
      toast.success('Payment recorded successfully');
      setPaymentModalOpen(false);
      setPaymentAmount(''); setPaymentNote(''); setPaymentUdhaarId(null);
      loadUdhaar();
    } catch {
      toast.error('Failed to record payment');
      setLoading(false);
    }
  };

  const submitAddUdhaar = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/udhaar', {
        customerName: newCustName,
        customerPhone: newCustPhone || '',
        totalAmount: parseFloat(newUdhaarAmt),
        description: newUdhaarDesc || '',
      });
      toast.success('Udhaar added successfully');
      setShowAddModal(false);
      setNewCustName(''); setNewCustPhone(''); setNewUdhaarAmt(''); setNewUdhaarDesc('');
      loadUdhaar();
    } catch {
      toast.error('Failed to add Udhaar');
      setLoading(false);
    }
  };

  const loadUdhaar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/udhaar/all');
      const data = (res.data.data || []).map(u => ({
        ...u,
        customerName: u.customerName || 'Unknown',
        phoneNumber: u.customerPhone || u.phoneNumber || '',
        amount: u.totalAmount || u.amount || 0,
        amountPaid: u.paidAmount || u.amountPaid || 0,
        pendingAmount: u.pendingAmount || (u.totalAmount - (u.paidAmount || 0)) || 0,
        status: u.status || getStatus(u.totalAmount || u.amount, u.paidAmount || u.amountPaid),
        initials: getInitials(u.customerName || 'Unknown'),
        date: u.date || u.createdAt || new Date().toISOString()
      }));
      setUdhaarData(data);
      if (data.length > 0) setSelectedCustomer(data[0]);
    } catch { toast.error('Failed to load credit book'); }
    finally { setLoading(false); }
  };

  const getStatus = (total, paid) => {
    const safePaid = paid || 0;
    if (safePaid === 0) return 'Pending';
    if (safePaid >= total) return 'Fully Paid';
    return 'Partially Paid';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const split = name.split(' ');
    if (split.length >= 2) return (split[0][0] + split[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const fmt = (v) => `₹${Math.max(0, v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const filtered = useMemo(() => {
    let result = udhaarData.filter(u => {
      const name = (u.customerName || '').toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || 
                          (u.phoneNumber && u.phoneNumber.includes(search));
      const matchTab = activeTab === 'All Customers' || 
                       (activeTab === 'Pending' && u.pendingAmount > 0 && u.amountPaid === 0) ||
                       (activeTab === 'Partially Paid' && u.pendingAmount > 0 && u.amountPaid > 0) ||
                       (activeTab === 'Fully Paid' && u.pendingAmount === 0);
      return matchSearch && matchTab;
    });

    if (sortBy === 'Highest Pending') result.sort((a, b) => b.pendingAmount - a.pendingAmount);
    else if (sortBy === 'Lowest Pending') result.sort((a, b) => a.pendingAmount - b.pendingAmount);
    else if (sortBy === 'Recent') result.sort((a, b) => new Date(b.date) - new Date(a.date));

    return result;
  }, [udhaarData, search, activeTab, sortBy]);

  // Summaries
  const totalCustomers = udhaarData.length;
  const totalUdhaar = udhaarData.reduce((s, u) => s + u.amount, 0);
  const totalReceived = udhaarData.reduce((s, u) => s + u.amountPaid, 0);
  const totalPending = udhaarData.reduce((s, u) => s + u.pendingAmount, 0);

  const getStatusClass = (status) => {
    if (status === 'Pending') return 'danger';
    if (status === 'Partially Paid') return 'warning';
    return 'success';
  };

  return (
    <div className="udhaar-pos-layout">
      {/* HEADER OVERRIDE */}
      <div className="udh-header">
        <div className="udh-brand">
          <div className="udh-titles">
            <h1 className="udh-title">Dukaan Dost 🏪</h1>
            <span className="udh-tagline">Smart Billing, Happy Business</span>
          </div>
        </div>
        
        <div className="udh-search-wrapper">
          <FiSearch className="udh-search-icon" />
          <input 
            type="text" 
            placeholder="Search customers by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="udh-search"
          />
        </div>

        <div className="udh-header-actions">
          <select className="udh-store-select">
            <option>Srinivas Kirana Store</option>
            <option>Branch 2</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Add Udhaar
          </button>
        </div>
      </div>

      <div className="udh-main">
        {/* LEFT PANE */}
        <div className="udh-left-pane">
          {/* Top Title & Summaries */}
          <div className="udh-top-section">
            <div className="udh-page-header">
              <div className="udh-page-titles">
                <h2>Udhaar (Credit Book)</h2>
                <p>Track customer dues and manage payments easily</p>
              </div>
              <div className="udh-page-actions">
                <button className="btn-icon outline" title="Filter"><FiFilter /></button>
                <div className="udh-sort-drop">
                  <span className="sort-label">Sort by:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option>Highest Pending</option>
                    <option>Lowest Pending</option>
                    <option>Recent</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="udh-summary-cards">
              <div className="udh-stat-card theme-blue">
                <div className="usc-icon"><FiUsers /></div>
                <div className="usc-info">
                  <span className="ulc-label">Total Customers</span>
                  <span className="usc-value">{totalCustomers}</span>
                </div>
              </div>
              <div className="udh-stat-card border-only">
                <div className="usc-icon text-muted"><FiDollarSign /></div>
                <div className="usc-info">
                  <span className="ulc-label">Total Udhaar</span>
                  <span className="usc-value">{fmt(totalUdhaar)}</span>
                </div>
              </div>
              <div className="udh-stat-card bg-green-subtle">
                <div className="usc-icon text-green"><FiCheckCircle /></div>
                <div className="usc-info">
                  <span className="ulc-label">Total Received</span>
                  <span className="usc-value text-green">{fmt(totalReceived)}</span>
                </div>
              </div>
              <div className="udh-stat-card bg-red-subtle">
                <div className="usc-icon text-red"><FiAlertCircle /></div>
                <div className="usc-info">
                  <span className="ulc-label">Total Pending</span>
                  <span className="usc-value text-red">{fmt(totalPending)}</span>
                </div>
              </div>
            </div>

            <div className="udh-tabs">
              {TABS.map(tab => (
                <button 
                  key={tab} 
                  className={`udh-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Content */}
          <div className="udh-grid-wrapper">
            {loading ? <div className="spinner"></div> : filtered.length > 0 ? (
              <div className="udh-grid">
                {filtered.map(u => {
                  const sClass = getStatusClass(u.status);
                  return (
                    <div 
                      key={u.id} 
                      className={`udh-card ${selectedCustomer?.id === u.id ? 'selected' : ''}`}
                      onClick={() => setSelectedCustomer(u)}
                    >
                      <div className="uc-header">
                        <div className="uc-cust">
                          <div className={`uc-avatar ${sClass}`}>{u.initials}</div>
                          <div className="uc-name-wrap">
                            <span className="uc-name">{u.customerName}</span>
                            <span className="uc-phone"><FiPhone size={10}/> {u.phoneNumber || 'N/A'}</span>
                          </div>
                        </div>
                        <div className={`uc-badge badge-${sClass}`}>{u.status}</div>
                      </div>

                      <div className="uc-financials">
                        <div className="uc-fin-block">
                          <span className="uf-label">Total</span>
                          <span className="uf-val">{fmt(u.amount)}</span>
                        </div>
                        <div className="uc-fin-block">
                          <span className="uf-label">Paid</span>
                          <span className="uf-val text-green">{fmt(u.amountPaid)}</span>
                        </div>
                        <div className="uc-fin-block">
                          <span className="uf-label">Pending</span>
                          <span className="uf-val text-red font-bold">{fmt(u.pendingAmount)}</span>
                        </div>
                      </div>

                      <div className="uc-actions">
                        <button className="btn-pay-small" onClick={(e) => openPaymentModal(u, e)}>
                          + Add Payment
                        </button>
                        <button className="btn-view-small">
                          View Details <FiArrowRight />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <FiUsers size={40} />
                <p>No customers found</p>
              </div>
            )}
          </div>

          <div className="udh-pagination-bar">
            <span>Showing 1 to {Math.min(9, filtered.length)} of {filtered.length} customers</span>
            <div className="pagination-ctrls">
              <button className="btn-page outline">&lt;</button>
              <button className="btn-page active">1</button>
              <button className="btn-page outline">2</button>
              <button className="btn-page outline">3</button>
              <button className="btn-page outline">&gt;</button>
            </div>
          </div>
        </div>

        {/* RIGHT DETAILS PANE */}
        <div className="udh-right-pane">
          {selectedCustomer ? (
            <div className="udh-details-panel">
              <div className="udp-cust-header">
                <div className={`udp-avatar ${getStatusClass(selectedCustomer.status)}`}>
                  {selectedCustomer.initials}
                </div>
                <h3>{selectedCustomer.customerName}</h3>
                <span className="udp-phone"><FiPhone /> {selectedCustomer.phoneNumber || 'N/A'}</span>
                <span className={`udp-badge badge-${getStatusClass(selectedCustomer.status)}`}>
                  {selectedCustomer.status}
                </span>
              </div>

              <div className="udp-fin-summary">
                <div className="uf-row">
                  <span>Total Amount</span>
                  <span className="font-bold">{fmt(selectedCustomer.amount)}</span>
                </div>
                <div className="uf-row text-green">
                  <span>Total Paid</span>
                  <span className="font-bold">{fmt(selectedCustomer.amountPaid)}</span>
                </div>
                <div className="uf-row text-red udp-grand-pending">
                  <span>Pending Due</span>
                  <span className="udp-gp-val">{fmt(selectedCustomer.pendingAmount)}</span>
                </div>
                <button className="btn-add-payment-large" onClick={() => openPaymentModal(selectedCustomer)}>
                  + Add Payment
                </button>
              </div>

              <div className="udp-history">
                <h4 className="udh-history-title">Recent Transactions</h4>
                
                {/* Mocking payment history from either actual history if available or dummies */}
                <div className="udp-timeline">
                  {selectedCustomer.amountPaid > 0 && (
                    <div className="udp-t-item">
                      <div className="t-dot bg-green"></div>
                      <div className="t-content">
                        <div className="t-head">
                          <span className="t-label">Payment received</span>
                          <span className="t-amt text-green">+{fmt(selectedCustomer.amountPaid)}</span>
                        </div>
                        <div className="t-meta">
                          <span className="t-date"><FiClock /> {new Date(selectedCustomer.date).toLocaleDateString()}</span>
                          <span className="t-method">Cash</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="udp-t-item">
                    <div className="t-dot bg-red"></div>
                    <div className="t-content">
                      <div className="t-head">
                        <span className="t-label">Udhaar Created</span>
                        <span className="t-amt">{fmt(selectedCustomer.amount)}</span>
                      </div>
                      <div className="t-meta">
                        <span className="t-date"><FiClock /> {new Date(selectedCustomer.date).toLocaleDateString()}</span>
                        <span className="t-desc">{selectedCustomer.description}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="btn-view-all">View All Transactions</button>
              </div>
            </div>
          ) : (
            <div className="empty-details">
              <FiUsers size={40} />
              <p>Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD UDHAAR MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="modal-content-large" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}>
              <div className="modal-header-premium">
                <div className="mhp-icon"><FiUsers /></div>
                <div>
                  <h2>Add Customer Udhaar</h2>
                  <p>Record a new credit entry for a customer. This will increase their pending balance.</p>
                </div>
              </div>
              
              <form onSubmit={submitAddUdhaar} className="modal-form-grid">
                <div className="form-section">
                  <h4 className="fs-title">Customer Information</h4>
                  <div className="form-group-p">
                    <label>Customer Name *</label>
                    <div className="input-with-icon">
                      <FiUsers />
                      <input type="text" placeholder="e.g. Raju Bhai" value={newCustName} onChange={e=>setNewCustName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group-p">
                    <label>Phone Number</label>
                    <div className="input-with-icon">
                      <FiSmartphone />
                      <input type="text" placeholder="10 digit mobile" value={newCustPhone} onChange={e=>setNewCustPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="form-section highlight-section">
                  <h4 className="fs-title">Credit Details</h4>
                  <div className="form-group-p">
                    <label>Credit Amount (Udhaar) ₹ *</label>
                    <div className="input-with-icon">
                      <FiDollarSign />
                      <input type="number" min="1" placeholder="0.00" value={newUdhaarAmt} onChange={e=>setNewUdhaarAmt(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group-p">
                    <label>Reason / Note</label>
                    <textarea 
                      style={{padding:'10px', borderRadius:'12px', border:'1.5px solid #e2e8f0', minHeight:'100px'}}
                      placeholder="e.g. Monthly groceries, milk bill, etc." 
                      value={newUdhaarDesc} 
                      onChange={e=>setNewUdhaarDesc(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="modal-footer-premium">
                  <button type="button" className="btn-cancel" onClick={()=>setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit-premium" disabled={loading}>
                    {loading ? <span className="btn-spinner"></span> : 'Save Udhaar Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {paymentModalOpen && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="modal-content" style={{maxWidth:'450px', background:'white', borderRadius:'24px', overflow:'hidden'}} initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}>
              <div className="modal-header-premium" style={{padding:'20px 30px'}}>
                <div className="mhp-icon" style={{width:'40px', height:'40px', fontSize:'1.2rem'}}><FiCreditCard /></div>
                <div>
                  <h3 style={{margin:0}}>Collect Payment</h3>
                  <p style={{fontSize:'0.8rem'}}>Record money received from customer</p>
                </div>
              </div>
              <form onSubmit={submitPayment} style={{padding:'30px'}}>
                <div className="form-group-p" style={{marginBottom:'20px'}}>
                  <label>Amount Received (₹) *</label>
                  <input 
                    type="number" 
                    autoFocus
                    placeholder="0.00" 
                    style={{width:'100%', fontSize:'1.2rem', fontWeight:'bold'}}
                    value={paymentAmount} 
                    onChange={e=>setPaymentAmount(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group-p" style={{marginBottom:'20px'}}>
                  <label>Payment Note</label>
                  <input type="text" placeholder="e.g. Partial payment" value={paymentNote} onChange={e=>setPaymentNote(e.target.value)} />
                </div>
                <div style={{display:'flex', gap:'12px', justifyContent:'flex-end'}}>
                  <button type="button" className="btn-cancel" onClick={()=>setPaymentModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-submit-premium" disabled={loading}>Record Payment</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
