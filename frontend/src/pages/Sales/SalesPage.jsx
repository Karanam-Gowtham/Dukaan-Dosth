import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiTag, FiShoppingBag, FiCamera, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './Sales.css';

const CATEGORIES = ['All Items', 'Grains', 'Pulses', 'Oil & Ghee', 'Snacks', 'Beverages', 'Household'];

export default function SalesPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);
  
  // Quick Add Item Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvName, setNewInvName] = useState('');
  const [newInvQty, setNewInvQty] = useState('');
  const [newInvUnit, setNewInvUnit] = useState('pack');
  const [newInvPrice, setNewInvPrice] = useState('');

  const submitQuickAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/inventory', {
        name: newInvName,
        quantity: parseInt(newInvQty, 10),
        unit: newInvUnit,
        minStockLevel: 10,
        price: parseFloat(newInvPrice),
        costPrice: parseFloat(newInvPrice) * 0.8
      });
      toast.success('Quick item added to stock');
      setShowAddModal(false);
      setNewInvName(''); setNewInvQty(''); setNewInvPrice('');
      loadInventory();
    } catch {
      toast.error('Failed to add item');
      setLoading(false);
    }
  };

  const toast = useToast();

  useEffect(() => { loadInventory(); }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/inventory');
      // Adding dummy images & categories for the POS mockup
      const data = (res.data.data || []).map((item, idx) => ({
        ...item,
        defaultCategory: getDummyCategory(item.name),
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff&size=128&font-size=0.33`
      }));
      setInventory(data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  function getDummyCategory(name) {
    const n = name.toLowerCase();
    if (n.includes('rice') || n.includes('wheat') || n.includes('atta')) return 'Grains';
    if (n.includes('dal') || n.includes('chana') || n.includes('moong')) return 'Pulses';
    if (n.includes('oil') || n.includes('ghee')) return 'Oil & Ghee';
    if (n.includes('biscuit') || n.includes('chips') || n.includes('namkeen')) return 'Snacks';
    if (n.includes('milk') || n.includes('tea') || n.includes('coffee') || n.includes('juice')) return 'Beverages';
    if (n.includes('soap') || n.includes('surf') || n.includes('cleaner')) return 'Household';
    return 'Household';
  }

  // Derived state
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All Items' || item.defaultCategory === activeCategory;
      return matchSearch && matchCat;
    });
  }, [inventory, search, activeCategory]);

  const cartSubtotal = cart.reduce((sum, c) => sum + ((c.item.price || 0) * c.qty), 0);
  const cartDiscount = parseFloat(discount) || 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);
  const totalItemsCount = cart.length;
  const totalQtyCount = cart.reduce((sum, c) => sum + c.qty, 0);

  // Cart actions
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.item.id === id) {
          const newQty = c.qty + delta;
          return { ...c, qty: Math.max(0, newQty) }; // allow 0 to trigger remove below
        }
        return c;
      }).filter(c => c.qty > 0);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => c.item.id !== id));
  };

  const clearCart = () => {
    if (window.confirm('Clear entire cart?')) setCart([]);
  };

  const holdBill = () => {
    if (cart.length === 0) return toast.info('Cart is already empty');
    localStorage.setItem('dd_held_bill', JSON.stringify({ cart, note, discount, paymentMode }));
    setCart([]); setNote(''); setDiscount('');
    toast.success('Bill placed on hold');
  };

  const restoreBill = () => {
    const held = localStorage.getItem('dd_held_bill');
    if (!held) return toast.info('No bills on hold');
    const { cart: hCart, note: hNote, discount: hDisc, paymentMode: hMode } = JSON.parse(held);
    setCart(hCart); setNote(hNote); setDiscount(hDisc); setPaymentMode(hMode);
    localStorage.removeItem('dd_held_bill');
    toast.success('Bill restored');
  };

  const scanBarcode = () => {
    const code = window.prompt('Scan or enter item barcode:');
    if (!code) return;
    const item = inventory.find(i => i.name.toLowerCase().includes(code.toLowerCase()));
    if (item) {
      addToCart(item);
      toast.success(`${item.name} added to cart`);
    } else {
      toast.error('Item not found in inventory');
    }
  };

  const generateBill = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    setSubmitting(true);
    
    try {
      // Create a sale payload.
      // We would ideally map cart items, but backend SalesController expects just { amount, description }.
      // If we expanded the backend, we would pass items array.
      let desc = `POS Bill - ${paymentMode}. Items: `;
      cart.forEach(c => desc += `${c.qty}x ${c.item.name}, `);
      if (note) desc += ` | Note: ${note}`;

      await api.post('/api/sales', {
        amount: cartTotal,
        description: desc.substring(0, 250) // truncate if long
      });
      
      toast.success('Bill Generated Successfully!');
      setCart([]);
      setDiscount('');
      setNote('');
      // Optionally reload inventory to reflect stock
      loadInventory();
      
    } catch (err) {
      toast.error('Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (v) => `₹${(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="pos-layout">
      {/* ===== POS HEADER (Overrides main layout topbar style) ===== */}
      <div className="pos-header">
        <div className="pos-brand">
          <div className="pos-titles">
            <h1 className="pos-title">Dukaan Dost 🏪</h1>
            <span className="pos-tagline">Smart Billing, Happy Business</span>
          </div>
        </div>
        
        <div className="pos-search-wrapper">
          <FiSearch className="pos-search-icon" />
          <input 
            type="text" 
            placeholder="Search items by name / barcode"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pos-search"
          />
        </div>

        <div className="pos-header-actions">
          <select className="pos-store-select">
            <option>Srinivas Kirana Store</option>
            <option>Branch 2</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><FiPlus /> Quick Add</button>
        </div>
      </div>

      <div className="pos-main">
        {/* ===== PRODUCTS SECTION ===== */}
        <section className="pos-products">
          <div className="pos-categories">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`pos-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="pos-grid-wrapper">
            {loading ? <div className="spinner"></div> : filteredItems.length > 0 ? (
              <div className="pos-grid">
                {filteredItems.map((item) => {
                  const cartItem = cart.find(c => c.item.id === item.id);
                  const inCartQty = cartItem ? cartItem.qty : 0;
                  
                  return (
                    <motion.div 
                      key={item.id} 
                      className="pos-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                    >
                      <div className="pos-card-img" style={{ backgroundImage: `url(${item.image})` }}>
                        <span className="pos-stock-badge">In Stock</span>
                      </div>
                      <div className="pos-card-content">
                        <h4 className="pos-item-name" title={item.name}>{item.name}</h4>
                        <div className="pos-item-price">{fmt(item.price)}</div>
                        
                        <div className="pos-item-actions">
                          {inCartQty > 0 ? (
                            <div className="qty-controls">
                              <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><FiMinus /></button>
                              <span className="qty-val">{inCartQty}</span>
                              <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><FiPlus /></button>
                            </div>
                          ) : (
                            <button className="pos-add-btn" onClick={() => addToCart(item)}>
                              Add to Card
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <FiShoppingBag size={40} />
                <p>No products found in "{activeCategory}"</p>
              </div>
            )}
          </div>

          <div className="pos-quick-actions">
            <button className="btn btn-outline btn-sm" onClick={holdBill}>Hold Bill</button>
            <button className="btn btn-outline btn-sm" onClick={restoreBill}>Recent Bills</button>
            <button className="btn btn-outline btn-sm" onClick={scanBarcode}><FiCamera /> Scan Barcode</button>
            <button className="btn btn-outline btn-sm" onClick={() => {
              const d = window.prompt("Enter Discount (₹)", discount);
              if (d !== null) setDiscount(d);
            }}>Apply Discount</button>
            <button className="btn btn-danger btn-sm" onClick={clearCart}>Clear Cart</button>
          </div>
        </section>

        {/* ===== BILLING SECTION (RIGHT PANEL) ===== */}
        <section className="pos-billing">
          <div className="bill-header">
            <h3>Bill ({totalItemsCount} Items)</h3>
          </div>

          <div className="bill-items">
            {cart.length > 0 ? cart.map((c) => (
              <div key={c.item.id} className="bill-item">
                <div className="bill-item-img" style={{ backgroundImage: `url(${c.item.image})` }}></div>
                <div className="bill-item-info">
                  <div className="bill-item-name-row">
                    <span className="bill-item-name">{c.item.name}</span>
                    <button className="btn-icon remove-btn" onClick={() => removeFromCart(c.item.id)}><FiTrash2 size={12} /></button>
                  </div>
                  <div className="bill-item-price-row">
                    <span className="bill-item-price">{fmt(c.item.price)} <small>x{c.qty}</small></span>
                    <span className="bill-item-total">{fmt(c.item.price * c.qty)}</span>
                  </div>
                  <div className="bill-qty-controls">
                    <button className="qty-btn small" onClick={() => updateQty(c.item.id, -1)}><FiMinus /></button>
                    <span className="qty-val small">{c.qty}</span>
                    <button className="qty-btn small" onClick={() => updateQty(c.item.id, 1)}><FiPlus /></button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-cart">
                <FiShoppingBag />
                <p>Cart is empty</p>
                <span>Add items from the grid</span>
              </div>
            )}
          </div>

          <div className="bill-summary">
            <div className="bill-note">
              <input type="text" placeholder="Add a note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-val">{fmt(cartSubtotal)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label text-blue"><FiTag /> Discount</span>
              <div className="discount-input-wrapper">
                <span>₹</span>
                <input type="number" className="discount-input" placeholder="0.00" value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>
            </div>
            <div className="summary-row">
              <span className="summary-label">Tax (0%)</span>
              <span className="summary-val">₹0.00</span>
            </div>
            
            <div className="bill-total-row">
              <span>Total Amount</span>
              <span className="bill-grand-total">{fmt(cartTotal)}</span>
            </div>

            <div className="payment-modes">
              <button 
                className={`pay-btn cash ${paymentMode === 'CASH' ? 'active' : ''}`}
                onClick={() => setPaymentMode('CASH')}
              >
                💵 Cash
              </button>
              <button 
                className={`pay-btn upi ${paymentMode === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMode('UPI')}
              >
                <FiSmartphone /> UPI
              </button>
              <button 
                className={`pay-btn card ${paymentMode === 'CARD' ? 'active' : ''}`}
                onClick={() => setPaymentMode('CARD')}
              >
                <FiCreditCard /> Card
              </button>
            </div>

            <div className="bill-footer-stats">
              <span>Total Qty: {totalQtyCount}</span>
              {cartDiscount > 0 && <span className="saved-text">Saved {fmt(cartDiscount)}</span>}
            </div>

            <button 
              className="btn-generate-bill" 
              onClick={generateBill} 
              disabled={submitting || cart.length === 0}
            >
              {submitting ? <span className="btn-spinner"></span> : 'Generate Bill'}
            </button>
          </div>
        </section>
      </div>

      {/* QUICK ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="modal-content" initial={{y:50}} animate={{y:0}} exit={{y:50}}>
              <h2>Quick Add Item</h2>
              <p style={{fontSize:'0.9rem', color:'var(--text-gray)', marginBottom:'20px'}}>Add an emergency item to stock for immediate billing.</p>
              
              <form onSubmit={submitQuickAdd} className="modal-form">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input type="text" value={newInvName} onChange={e=>setNewInvName(e.target.value)} required />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input type="number" min="1" value={newInvQty} onChange={e=>setNewInvQty(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Unit (kg, pack, etc)</label>
                    <input type="text" value={newInvUnit} onChange={e=>setNewInvUnit(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input type="number" min="0.5" step="0.5" value={newInvPrice} onChange={e=>setNewInvPrice(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={()=>setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>Add to System</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
