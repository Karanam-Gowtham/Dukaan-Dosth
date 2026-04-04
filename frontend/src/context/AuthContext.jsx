import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('dd_token');
    const savedUser = localStorage.getItem('dd_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    const data = res.data.data;
    const jwt = data.token;
    const userInfo = { name: data.name, phone: data.phone, shopName: data.shopName };
    localStorage.setItem('dd_token', jwt);
    localStorage.setItem('dd_user', JSON.stringify(userInfo));
    setToken(jwt);
    setUser(userInfo);
    return userInfo;
  };

  const register = async (name, phone, password, shopName) => {
    const res = await api.post('/auth/register', { name, phone, password, shopName });
    const data = res.data.data;
    const jwt = data.token;
    const userInfo = { name: data.name, phone: data.phone, shopName: data.shopName };
    localStorage.setItem('dd_token', jwt);
    localStorage.setItem('dd_user', JSON.stringify(userInfo));
    setToken(jwt);
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('dd_token');
    localStorage.removeItem('dd_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
