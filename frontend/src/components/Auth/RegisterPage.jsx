import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiLock, FiUser, FiShoppingBag, FiGlobe } from 'react-icons/fi';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
    shopName: '',
    preferredLanguage: 'en',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast(t('auth.password_mismatch') || 'Passwords do not match!', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      showToast(t('auth.register_success') || 'Account created!', 'success');
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
        <h1 className="auth-title mt-6">{t('auth.register')}</h1>
        <p className="text-muted mb-6">{t('app_tagline')}</p>
      </div>

      <form className="auth-form card-glass" onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div className="input-group mb-4">
          <label className="input-label">{t('auth.owner_name')}</label>
          <div className="input-wrapper">
            <FiUser className="input-icon" />
            <input
              name="ownerName"
              className="input"
              placeholder="John Doe"
              value={formData.ownerName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group mb-4">
          <label className="input-label">{t('auth.shop_name')}</label>
          <div className="input-wrapper">
            <FiShoppingBag className="input-icon" />
            <input
              name="shopName"
              className="input"
              placeholder="Dukaan Name"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Auth Details */}
        <div className="input-group mb-4">
          <label className="input-label">{t('auth.phone')}</label>
          <div className="input-wrapper">
            <FiPhone className="input-icon" />
            <input
              name="phone"
              type="tel"
              className="input"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group mb-4">
          <label className="input-label">{t('auth.password')}</label>
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group mb-4">
          <label className="input-label">{t('auth.confirm_password')}</label>
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              name="confirmPassword"
              type="password"
              className="input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Language Selection */}
        <div className="input-group mb-6">
          <label className="input-label">{t('auth.language')}</label>
          <div className="input-wrapper">
            <FiGlobe className="input-icon" />
            <select
              name="preferredLanguage"
              className="select"
              value={formData.preferredLanguage}
              onChange={handleChange}
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-block ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? t('common.loading') : t('auth.register_btn')}
        </button>

        <div className="auth-footer text-center mt-4">
          <p className="text-muted">
            {t('auth.has_account')}{' '}
            <Link to="/login" className="text-primary font-bold">
              {t('auth.login_btn')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
