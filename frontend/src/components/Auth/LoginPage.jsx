import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      showToast(t('common.error'), 'error');
      return;
    }

    setLoading(true);
    try {
      await login(phone, password);
      showToast(t('auth.login_success') || 'Login successful!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header text-center">
        <h1 className="auth-title mt-6">{t('auth.login')}</h1>
        <p className="text-muted mb-6">{t('app_tagline')}</p>
      </div>

      <form className="auth-form card-glass" onSubmit={handleSubmit}>
        <div className="input-group mb-4">
          <label className="input-label" htmlFor="phone">
            {t('auth.phone')}
          </label>
          <div className="input-wrapper">
            <FiPhone className="input-icon" />
            <input
              id="phone"
              type="tel"
              className="input"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group mb-6">
          <label className="input-label" htmlFor="password">
            {t('auth.password')}
          </label>
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-block ${loading ? 'loading' : ''}`}
          disabled={loading}
          id="login-submit-btn"
        >
          {loading ? t('common.loading') : t('auth.login_btn')}
        </button>

        <div className="auth-footer text-center mt-4">
          <p className="text-muted">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-primary font-bold">
              {t('auth.register_btn')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
