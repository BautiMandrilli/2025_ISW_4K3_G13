import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-emoji">🌳</div>
          <h1 className="brand-title">Eco Park</h1>
        </div>
        
        <div className="user-section">
          <span className="welcome-text">
            Bienvenido, <strong>{user?.username}</strong>
          </span>
          <button 
            className="logout-button"
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;