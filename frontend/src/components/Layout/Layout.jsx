import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div className="layout">
      {user && <Header />}
      <main className={`page ${!user ? 'auth-page' : ''}`}>
        <div className="container">
          {children}
        </div>
      </main>
      {user && <BottomNav />}
    </div>
  );
}
