import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome, FiPlus, FiClock, FiBarChart2 } from 'react-icons/fi';
import './Layout.css';

export default function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-link">
          <FiHome className="nav-icon" />
          <span>{t('nav.home')}</span>
        </NavLink>
        <NavLink to="/history" className="nav-link">
          <FiClock className="nav-icon" />
          <span>{t('nav.history')}</span>
        </NavLink>
        <NavLink to="/add" className="nav-btn-main">
          <FiPlus />
        </NavLink>
        <NavLink to="/charts" className="nav-link">
          <FiBarChart2 className="nav-icon" />
          <span>{t('nav.charts')}</span>
        </NavLink>
      </div>
    </nav>
  );
}
