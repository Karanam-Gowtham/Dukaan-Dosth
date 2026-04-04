import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiLock, FiUser, FiShoppingBag } from 'react-icons/fi';
import './Auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShop, setRegShop] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginPhone, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(regName, regPhone, regPassword, regShop);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-brand">
          <div className="auth-logo-icon">🏪</div>
          <h1 className="auth-title">Dukaan Dost</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Welcome back! Login to your store' : 'Create your business account'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
          <div className={`auth-tab-indicator ${!isLogin ? 'right' : ''}`}></div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              className="auth-form"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="input-group">
                <div className="input-icon"><FiPhone /></div>
                <input type="tel" placeholder="Phone Number" maxLength="10" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} required />
              </div>
              <div className="input-group">
                <div className="input-icon"><FiLock /></div>
                <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Login'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              onSubmit={handleRegister}
              className="auth-form"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="input-group">
                <div className="input-icon"><FiUser /></div>
                <input type="text" placeholder="Your Name" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>
              <div className="input-group">
                <div className="input-icon"><FiPhone /></div>
                <input type="tel" placeholder="Phone Number" maxLength="10" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
              </div>
              <div className="input-group">
                <div className="input-icon"><FiLock /></div>
                <input type="password" placeholder="Password (min 4 chars)" minLength="4" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
              </div>
              <div className="input-group">
                <div className="input-icon"><FiShoppingBag /></div>
                <input type="text" placeholder="Shop Name" value={regShop} onChange={e => setRegShop(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Create Account'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
