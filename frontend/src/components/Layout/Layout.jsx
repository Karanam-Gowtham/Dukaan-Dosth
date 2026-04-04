import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiDollarSign, FiCreditCard, FiPackage,
  FiUsers, FiBarChart2, FiCpu, FiLogOut, FiMenu, FiX, FiBell, FiPlusCircle, FiList
} from 'react-icons/fi';
import './Layout.css';

const navItems = [
  { path: '/', icon: <FiGrid />, label: 'Dashboard' },
  { path: '/add', icon: <FiPlusCircle />, label: 'AI Transaction' },
  { path: '/sales', icon: <FiDollarSign />, label: 'Billing' },
  { path: '/ledger', icon: <FiList />, label: 'Business Ledger' },
  { path: '/expenses', icon: <FiCreditCard />, label: 'Expenses' },
  { path: '/inventory', icon: <FiPackage />, label: 'Inventory' },
  { path: '/udhaar', icon: <FiUsers />, label: 'Udhaar' },
  { path: '/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
  { path: '/ai-insights', icon: <FiCpu />, label: 'AI Insights' },
];

const pageTitles = {
  '/': 'Dashboard',
  '/add': 'AI Transaction Input',
  '/sales': 'Billing',
  '/ledger': 'Business Ledger',
  '/expenses': 'Expenses',
  '/inventory': 'Inventory',
  '/udhaar': 'Udhaar',
  '/analytics': 'Analytics',
  '/ai-insights': 'AI Insights',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const userInitial = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="layout">
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-emoji">🏪</span>
            <div className="brand-text">
              <span className="brand-name">Dukaan Dost</span>
              <span className="brand-shop">{user?.shopName || 'My Shop'}</span>
            </div>
          </div>
          {isMobile && (
            <button className="btn-icon sidebar-close" onClick={() => setSidebarOpen(false)}>
              <FiX />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-active-bar"></span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{userInitial}</div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">Shop Owner</span>
            </div>
          </div>
          <button className="btn-icon logout-btn" onClick={logout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar glass">
          <div className="topbar-left">
            <button className="btn-icon mobile-menu" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <h2 className="page-title">{pageTitle}</h2>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">{today}</span>
            <div className="topbar-bell">
              <FiBell />
            </div>
            <div className="topbar-avatar" title={user?.name}>
              {userInitial}
            </div>
          </div>
        </header>

        <main className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
