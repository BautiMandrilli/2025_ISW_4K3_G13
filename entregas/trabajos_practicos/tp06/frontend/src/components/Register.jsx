import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { username, email, password, confirmPassword } = formData;

    // Validaciones
    if (!username || !email || !password || !confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    const result = await register(username, email, password);
    
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
        
        <h2>Crear Cuenta</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Usuario123"
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button 
              type="button" 
              className="switch-button"
              onClick={onToggleMode}
              disabled={loading}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;