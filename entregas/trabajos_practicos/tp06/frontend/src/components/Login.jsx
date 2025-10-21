import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Todos los campos son requeridos');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand-header" aria-label="Eco park header">
          <div className="brand-emoji" aria-hidden>🌳</div>
          <h1 className="brand-title">Eco park</h1>
        </div>
        
        <h2>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="ejemplo@correo.com"
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            ¿No tienes cuenta?{' '}
            <button 
              type="button" 
              className="switch-button"
              onClick={onToggleMode}
              disabled={loading}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;