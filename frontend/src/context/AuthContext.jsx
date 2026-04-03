import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { id: 1, name: 'Demo User', phone: '9999999999', shop_name: 'Super Market', languagePref: 'en' };
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || 'bypass-token');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = true; // Always authenticated

  const login = async (phone, password) => {
    localStorage.setItem('token', 'bypass-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Demo User', phone, shop_name: 'Demo Shop', languagePref: 'en' }));
    setToken('bypass-token');
    setUser({ id: 1, name: 'Demo User', phone, shop_name: 'Demo Shop', languagePref: 'en' });
    return { success: true };
  };

  const register = async (data) => {
    localStorage.setItem('token', 'bypass-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, ...data, languagePref: 'en' }));
    setToken('bypass-token');
    setUser({ id: 1, ...data, languagePref: 'en' });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Even if logged out temporarily, next refresh will log them right back in!
  };

  const updateLanguage = (lang) => {
    if (user) {
      const updated = { ...user, languagePref: lang };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
    localStorage.setItem('lang', lang);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
