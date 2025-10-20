import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ open, message, type = 'error', autoHideMs = 4000, onClose }) {
  useEffect(() => {
    if (!open) return;
    if (!autoHideMs) return;
    const t = setTimeout(() => onClose && onClose(), autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);

  if (!open) return null;

  return (
    <div className="toast-overlay" onClick={onClose}>
      <div className={`toast ${type}`} role="alert" aria-live="polite" aria-atomic="true" onClick={(e) => e.stopPropagation()}>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose} aria-label="Cerrar">
          &times;
        </button>
      </div>
    </div>
  );
}
