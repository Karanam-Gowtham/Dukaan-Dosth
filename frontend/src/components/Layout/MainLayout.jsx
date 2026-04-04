import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Users, 
  Settings, 
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 p-3 rounded-xl transition-all duration-200
      ${isActive 
        ? 'bg-indigo-600/10 text-indigo-500 shadow-sm ring-1 ring-indigo-500/20' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
    `}
  >
    <Icon size={22} className="min-w-[22px]" />
    {!collapsed && <span className="font-semibold text-sm">{label}</span>}
  </NavLink>
);

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard') },
    { to: '/input', icon: PlusCircle, label: t('nav.add', 'New Transaction') },
    { to: '/history', icon: History, label: t('nav.history', 'Ledger') },
    { to: '/udhaar', icon: Users, label: t('nav.udhaar', 'Udhaar Management') }
  ];

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(next);
    document.body.className = next === 'te' ? 'lang-te' : '';
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-main">
      
      {/* --- Desktop Sidebar --- */}
      <aside className={`
        hidden lg:flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-20'}
      `}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-indigo">D</div>
              <span className="font-display font-bold text-xl tracking-tight">DukaanDost</span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-indigo-600 rounded-lg mx-auto flex items-center justify-center font-bold text-white shadow-indigo">D</div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => (
            <NavItem 
              key={link.to} 
              to={link.to} 
              icon={link.icon} 
              label={link.label} 
              collapsed={!isSidebarOpen} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 p-3 w-full text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors font-semibold text-sm"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>{t('auth.logout', 'Sign Out')}</span>}
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 z-50">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block text-slate-400 hover:text-white transition-colors">
            {isSidebarOpen ? <Menu /> : <ChevronRight />}
          </button>
          
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-indigo">D</div>
            <span className="font-display font-bold text-lg tracking-tight">DukaanDost</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1 text-xs font-bold ring-1 ring-slate-800 rounded-full hover:bg-slate-800 transition-colors"
            >
              {i18n.language === 'en' ? 'తెలుగు' : 'English'}
            </button>
            
            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-100">{user?.ownerName}</p>
                <p className="text-xs text-slate-500">{user?.shopName}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-600/30 flex items-center justify-center overflow-hidden">
                 <User className="text-indigo-400" size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <section className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="container app-container max-w-full">
            {children}
          </div>
        </section>

        {/* --- Mobile Bottom Nav --- */}
        <nav className="lg:hidden bottom-nav">
          {navLinks.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `
                nav-link ${isActive ? 'active' : ''}
              `}
            >
              <link.icon className="nav-icon" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default MainLayout;
