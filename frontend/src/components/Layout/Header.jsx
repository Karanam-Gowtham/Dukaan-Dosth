import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiPlusCircle, FiClock, FiBarChart2 } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    document.body.classList.toggle('lang-te', newLang === 'te');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand" onClick={() => navigate('/')}>
          <span className="header-logo">🏪</span>
          <div>
            <h1 className="header-title">{t('app_name')}</h1>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="lang-toggle"
            onClick={toggleLang}
            title="Switch Language"
            id="lang-toggle-btn"
          >
            {i18n.language === 'en' ? 'తెలుగు' : 'ENG'}
          </button>
          <button
            className="btn-ghost header-logout"
            onClick={logout}
            id="logout-btn"
          >
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </header>
  );
}
