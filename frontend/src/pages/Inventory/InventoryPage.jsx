import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiMinus, FiEdit2, FiTrash2, FiGrid, FiList, FiUpload, FiPackage, FiTrendingUp } from 'react-icons/fi';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './Inventory.css';

const CATEGORIES = ['All', 'Grains', 'Pulses', 'Oil & Ghee', 'Snacks', 'Beverages', 'Household', 'More'];
const STOCK_FILTERS = ['All Stock', 'In Stock', 'Low Stock', 'Out of Stock'];

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All Stock');
  const [viewMode, setViewMode] = useState('grid');
  
  // selection & details
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvName, setNewInvName] = useState('');
  const [newInvQty, setNewInvQty] = useState('');
  const [newInvUnit, setNewInvUnit] = useState('pack');
  const [newInvMin, setNewInvMin] = useState('10');
  const [newInvPrice, setNewInvPrice] = useState('');
  const [newInvCost, setNewInvCost] = useState('');
  
  const [editingId, setEditingId] = useState(null);

  const openEditModal = (e, item) => {
    e.stopPropagation();
    setEditingId(item.id);
    setNewInvName(item.name);
    setNewInvQty(item.quantity);
    setNewInvUnit(item.unit || 'pack');
    setNewInvMin(item.minStockLevel || 10);
    setNewInvPrice(item.price || '');
    setNewInvCost(item.costPrice || '');
    setShowAddModal(true);
  };

  const deleteItem = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this specific item?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/inventory/${id}`);
      toast.success('Item deleted successfully');
      if (selectedItem && selectedItem.id === id) setSelectedItem(null);
      loadInventory();
    } catch {
      toast.error('Failed to delete item');
      setLoading(false);
    }
  };

  const submitAddInv = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: newInvName,
        quantity: parseInt(newInvQty, 10),
        unit: newInvUnit,
        minStockLevel: parseInt(newInvMin, 10),
        price: parseFloat(newInvPrice),
        costPrice: parseFloat(newInvCost)
      };

      if (editingId) {
        await api.put(`/api/inventory/${editingId}`, payload);
        toast.success('Item updated successfully');
      } else {
        await api.post('/api/inventory', payload);
        toast.success('Item added to Inventory');
      }
      
      setShowAddModal(false);
      setEditingId(null);
      setNewInvName(''); setNewInvQty(''); setNewInvPrice(''); setNewInvCost('');
      loadInventory();
    } catch {
      toast.error(editingId ? 'Failed to update item' : 'Failed to add item');
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewInvName(''); setNewInvQty(''); setNewInvPrice(''); setNewInvCost('');
    setShowAddModal(true);
  };

  const toast = useToast();

  useEffect(() => { loadInventory(); }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/inventory');
      const data = (res.data.data || []).map(item => ({
        ...item,
        defaultCategory: getDummyCategory(item.name),
        // Placeholder image matching item name
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff&size=200`,
        profitMargin: calcProfitMargin(item.price, item.costPrice)
      }));
      setInventory(data);
      if (data.length > 0) setSelectedItem(data[0]);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  const getDummyCategory = (name) => {
    const n = name.toLowerCase();
    if (n.includes('rice') || n.includes('wheat') || n.includes('atta')) return 'Grains';
    if (n.includes('dal') || n.includes('chana')) return 'Pulses';
    if (n.includes('oil') || n.includes('ghee')) return 'Oil & Ghee';
    if (n.includes('biscuit') || n.includes('chips')) return 'Snacks';
    if (n.includes('milk') || n.includes('tea') || n.includes('juice')) return 'Beverages';
    if (n.includes('soap') || n.includes('surf')) return 'Household';
    return 'Household';
  };

  const calcProfitMargin = (price, cost) => {
    if (!price || !cost || cost === 0) return 0;
    return (((price - cost) / cost) * 100).toFixed(1);
  };

  const getStockStatus = (qty, minSet) => {
    const min = minSet || 10;
    if (qty <= 0) return 'Out of Stock';
    if (qty < min) return 'Low Stock';
    return 'In Stock';
  };

  // Filtered array
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All' || item.defaultCategory === activeCategory;
      const status = getStockStatus(item.quantity, item.minStockLevel);
      const matchStock = stockFilter === 'All Stock' || status === stockFilter;
      return matchSearch && matchCat && matchStock;
    });
  }, [inventory, search, activeCategory, stockFilter]);

  // Summaries
  const totalItems = inventory.length;
  const outOfStockCount = inventory.filter(i => i.quantity <= 0).length;
  const lowStockCount = inventory.filter(i => i.quantity > 0 && i.quantity < (i.minStockLevel || 10)).length;
  const totalValue = inventory.reduce((sum, i) => sum + ((i.costPrice || 0) * (i.quantity || 0)), 0);

  const fmt = (v) => `₹${(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const quickUpdateStock = async (id, delta) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    
    // Optimistic UI
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    if (selectedItem?.id === id) setSelectedItem(prev => ({ ...prev, quantity: newQty }));

    try {
      await api.put(`/api/inventory/${id}`, {
        name: item.name, quantity: newQty, unit: item.unit,
        price: item.price, costPrice: item.costPrice, minStockLevel: item.minStockLevel
      });
      toast.success('Stock updated');
    } catch {
      toast.error('Failed to update stock');
      loadInventory(); // revert on fail
    }
  };

  const statusColorMap = { 'In Stock': 'success', 'Low Stock': 'warning', 'Out of Stock': 'danger' };

  return (
    <div className="inv-pos-layout">
      {/* ===== HEADER ===== */}
      <div className="inv-header">
        <div className="inv-brand">
          <div className="inv-titles">
            <h1 className="inv-title">Dukaan Dost 🏪</h1>
            <span className="inv-tagline">Smart Billing, Happy Business</span>
          </div>
        </div>
        
        <div className="inv-search-wrapper">
          <FiSearch className="inv-search-icon" />
          <input 
            type="text" 
            placeholder="Search items, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="inv-search"
          />
        </div>

        <div className="inv-header-actions">
          <select className="inv-store-select">
            <option>Srinivas Kirana Store</option>
            <option>Warehouse 1</option>
          </select>
          <button className="btn btn-outline" onClick={() => toast.info('Importing...')}>
            <FiUpload /> Import Stock
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Add Item
          </button>
        </div>
      </div>

      <div className="inv-main">
        {/* ===== LEFT MAIN AREA ===== */}
        <div className="inv-left-pane">
          
          {/* Top Filters & Controls */}
          <div className="inv-filters-bar">
            <div className="inv-categories">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} className={`inv-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >{cat}</button>
              ))}
            </div>
            
            <div className="inv-sub-filters">
              <div className="inv-stock-filters">
                {STOCK_FILTERS.map(sf => {
                  let cls = '';
                  if (sf === 'In Stock') cls = 'filter-success';
                  else if (sf === 'Low Stock') cls = 'filter-warning';
                  else if (sf === 'Out of Stock') cls = 'filter-danger';
                  
                  return (
                    <button 
                      key={sf} 
                      className={`inv-stock-filter-btn ${cls} ${stockFilter === sf ? 'active' : ''}`}
                      onClick={() => setStockFilter(sf)}
                    >
                      {stockFilter === sf && <span className="active-dot"></span>}
                      {sf}
                    </button>
                  )
                })}
              </div>

              <div className="inv-view-toggles">
                <button className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                  <FiGrid />
                </button>
                <button className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          <div className="inv-grid-wrapper">
            {loading ? <div className="spinner"></div> : filteredItems.length > 0 ? (
              <div className={`inv-items ${viewMode === 'list' ? 'view-list' : 'view-grid'}`}>
                {filteredItems.map(item => {
                  const status = getStockStatus(item.quantity, item.minStockLevel);
                  const statusCls = statusColorMap[status];

                  return (
                    <div 
                      key={item.id} 
                      className={`inv-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="inv-item-img-wrap">
                        <img src={item.image} alt={item.name} className="inv-item-img" />
                        <span className={`inv-item-badge ${statusCls}`}>{status}</span>
                      </div>
                      
                      <div className="inv-item-info">
                        <h4 className="inv-item-name">{item.name}</h4>
                        <div className="inv-item-meta">
                          <span>{item.defaultCategory}</span> • <span>{item.unit || '1 unit'}</span>
                        </div>
                        
                        <div className="inv-item-numbers">
                          <div className="inv-item-qty">
                            <span className="qty-label">Qty</span>
                            <span className="qty-val">{item.quantity} {item.unit || 'pcs'}</span>
                          </div>
                          <div className="inv-item-min">
                            <span className="qty-label">Min. Stock</span>
                            <span className="min-val">{item.minStockLevel || 10}</span>
                          </div>
                        </div>

                        <div className="inv-item-pricing">
                          <div className="inv-price-block">
                            <span className="price-label">Price</span>
                            <span className="price-val text-blue">{fmt(item.price)}</span>
                          </div>
                          <div className="inv-price-block">
                            <span className="price-label">Cost</span>
                            <span className="price-val">{fmt(item.costPrice)}</span>
                          </div>
                          <div className="inv-profit-block">
                            <span className="profit-val text-green">+{item.profitMargin}%</span>
                          </div>
                        </div>

                        <div className="inv-item-controls">
                          <button className="ctrl-btn minus" onClick={(e) => { e.stopPropagation(); quickUpdateStock(item.id, -1); }}><FiMinus /></button>
                          <button className="ctrl-btn quick-add" onClick={(e) => { e.stopPropagation(); quickUpdateStock(item.id, 10); }}>+10</button>
                          <button className="ctrl-btn plus" onClick={(e) => { e.stopPropagation(); quickUpdateStock(item.id, 1); }}><FiPlus /></button>
                          <div className="spacer"></div>
                          <button className="ctrl-btn icon-only" onClick={(e) => openEditModal(e, item)}><FiEdit2 size={13}/></button>
                          <button className="ctrl-btn icon-only text-red" onClick={(e) => deleteItem(e, item.id)}><FiTrash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <FiPackage size={48} />
                <p>No inventory items match your search or filter.</p>
              </div>
            )}
          </div>

          {/* Bottom Summary Cards */}
          <div className="inv-bottom-summary">
            <div className="summary-card theme-blue">
              <span className="summary-title">Total Items</span>
              <span className="summary-value">{totalItems}</span>
            </div>
            <div className="summary-card theme-orange">
              <span className="summary-title">Low Stock</span>
              <span className="summary-value">{lowStockCount}</span>
            </div>
            <div className="summary-card theme-red">
              <span className="summary-title">Out of Stock</span>
              <span className="summary-value">{outOfStockCount}</span>
            </div>
            <div className="summary-card theme-green">
              <span className="summary-title">Total Value</span>
              <span className="summary-value">{fmt(totalValue)}</span>
            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL (DETAILS) ===== */}
        <div className="inv-right-pane">
          {selectedItem ? (
            <div className="inv-details-card">
              <div className="details-img-area">
                <img src={selectedItem.image} alt={selectedItem.name} className="details-img" />
                <span className={`details-badge ${statusColorMap[getStockStatus(selectedItem.quantity, selectedItem.minStockLevel)]}`}>
                  {getStockStatus(selectedItem.quantity, selectedItem.minStockLevel)}
                </span>
              </div>
              
              <div className="details-header">
                <h2>{selectedItem.name}</h2>
                <span className="details-category">{selectedItem.defaultCategory} • {selectedItem.unit || 'unit'}</span>
              </div>

              <div className="details-stat-grid">
                <div className="detail-stat">
                  <span className="ds-label">Current Stock</span>
                  <span className="ds-val">{selectedItem.quantity} <small>{selectedItem.unit}</small></span>
                </div>
                <div className="detail-stat">
                  <span className="ds-label">Min Stock Level</span>
                  <span className="ds-val">{selectedItem.minStockLevel || 10}</span>
                </div>
                <div className="detail-stat">
                  <span className="ds-label">Selling Price</span>
                  <span className="ds-val text-blue">{fmt(selectedItem.price)}</span>
                </div>
                <div className="detail-stat">
                  <span className="ds-label">Cost Price</span>
                  <span className="ds-val">{fmt(selectedItem.costPrice)}</span>
                </div>
              </div>

              <div className="details-profit-banner">
                <span className="dp-label">Est. Profit Margin</span>
                <span className="dp-val text-green"><FiTrendingUp /> {selectedItem.profitMargin}%</span>
              </div>

              <div className="details-history">
                <h4 className="dh-title">Recent Stock History</h4>
                <div className="dh-timeline">
                  <div className="dh-item">
                    <span className="dh-dot bg-green"></span>
                    <div className="dh-info">
                      <span className="dh-action">Added Stock (+50)</span>
                      <span className="dh-date">Today, 09:41 AM</span>
                    </div>
                  </div>
                  <div className="dh-item">
                    <span className="dh-dot bg-red"></span>
                    <div className="dh-info">
                      <span className="dh-action">Sold (-2)</span>
                      <span className="dh-date">Yesterday, 04:12 PM</span>
                    </div>
                  </div>
                  <div className="dh-item">
                    <span className="dh-dot bg-green"></span>
                    <div className="dh-info">
                      <span className="dh-action">Initial Entry (+10)</span>
                      <span className="dh-date">01 Apr 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="details-actions">
                <button className="btn btn-outline" onClick={(e) => openEditModal(e, selectedItem)}><FiEdit2 /> Edit</button>
                <button className="btn btn-danger-outline" onClick={(e) => deleteItem(e, selectedItem.id)}><FiTrash2 /> Delete</button>
              </div>
            </div>
          ) : (
            <div className="empty-details">
              <FiPackage size={40} />
              <p>Select an item to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="modal-content-large" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}>
              <div className="modal-header-premium">
                <div className="mhp-icon"><FiPackage /></div>
                <div>
                  <h2>{editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
                  <p>Fill in the details to {editingId ? 'update the' : 'register a new'} product in your digital stock.</p>
                </div>
              </div>
              
              <form onSubmit={submitAddInv} className="modal-form-grid">
                <div className="form-section">
                  <h4 className="fs-title">Basic Information</h4>
                  <div className="form-group-p">
                    <label>Product Name *</label>
                    <div className="input-with-icon">
                      <FiTag />
                      <input type="text" placeholder="e.g. Basmati Rice 5kg" value={newInvName} onChange={e=>setNewInvName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group-p">
                      <label>Stock Quantity *</label>
                      <input type="number" min="0" placeholder="0" value={newInvQty} onChange={e=>setNewInvQty(e.target.value)} required />
                    </div>
                    <div className="form-group-p">
                      <label>Unit</label>
                      <select value={newInvUnit} onChange={e=>setNewInvUnit(e.target.value)}>
                        <option value="pack">Pack / Bottle</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="box">Box / Case</option>
                        <option value="litre">Litre (L)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group-p">
                    <label>Minimum Stock Alert Level</label>
                    <input type="number" min="1" value={newInvMin} onChange={e=>setNewInvMin(e.target.value)} />
                    <small>We'll alert you when stock falls below this number.</small>
                  </div>
                </div>

                <div className="form-section highlight-section">
                  <h4 className="fs-title">Pricing & Profit</h4>
                  <div className="form-group-p">
                    <label>Cost Price (Buy Price) ₹</label>
                    <div className="input-with-icon">
                      <FiDollarSign />
                      <input type="number" min="0" step="0.5" placeholder="0.00" value={newInvCost} onChange={e=>setNewInvCost(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group-p">
                    <label>Selling Price (MRP) ₹ *</label>
                    <div className="input-with-icon">
                      <FiTrendingUp />
                      <input type="number" min="0" step="0.5" placeholder="0.00" value={newInvPrice} onChange={e=>setNewInvPrice(e.target.value)} required />
                    </div>
                  </div>
                  
                  <div className="profit-calculator-preview">
                    <span className="pcp-label">Estimated Profit:</span>
                    <span className="pcp-val">
                      {newInvPrice && newInvCost ? `₹${(newInvPrice - newInvCost).toFixed(2)}` : '₹0.00'}
                    </span>
                  </div>
                </div>

                <div className="modal-footer-premium">
                  <button type="button" className="btn-cancel" onClick={()=>setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit-premium" disabled={loading}>
                    {loading ? <span className="btn-spinner"></span> : (editingId ? 'Update Product' : 'Register Product')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
