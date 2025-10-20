import React, { useState } from "react";
import axios from "axios";
import "./CompraEntradas.css";
import Toast from "./Toast";
import "./Toast.css";

function CompraEntradas() {
  const [cantidad, setCantidad] = useState("1");
  const [entradas, setEntradas] = useState([{ nombre: "", fecha_uso: "" }]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const MAX_ENTRADAS = 10;

  // Toast state for entries feedback
  const [toast, setToast] = useState({ open: false, type: 'error', message: '' });

  const handleCantidadChange = (e) => {
    const raw = e.target.value;
    // Permitir campo vacío mientras escribe
    if (raw === "") {
      setCantidad("");
      setError("Ingresa una cantidad");
      return;
    }
    // Aceptar solo dígitos
    if (!/^\d+$/.test(raw)) {
      return; // ignorar otros caracteres
    }
    const n = parseInt(raw, 10);
    setCantidad(raw);
    if (n > MAX_ENTRADAS) {
      const msg = `No puedes comprar más de ${MAX_ENTRADAS} entradas`;
      setError(msg);
      setToast({ open: true, type: 'error', message: msg });
    } else if (n < 1) {
      const msg = "La cantidad debe ser al menos 1";
      setError(msg);
      setToast({ open: true, type: 'error', message: msg });
    } else {
      setError("");
    }
    // Ajustar solo el número de tarjetas renderizadas entre 1 y MAX_ENTRADAS
    const renderCount = Math.max(1, Math.min(n, MAX_ENTRADAS));
    const newEntradas = [];
    for (let i = 0; i < renderCount; i++) {
      newEntradas.push(entradas[i] || { nombre: "", fecha_uso: "" });
    }
    setEntradas(newEntradas);
  };

  const handleEntradaChange = (index, field, value) => {
    const newEntradas = [...entradas];
    newEntradas[index][field] = value;
    setEntradas(newEntradas);
  };

  const handleSubmit = async () => {
    // Validar cantidad a partir del input escrito
    const n = parseInt(cantidad, 10);
    if (isNaN(n) || n < 1) {
      const msg = 'Ingresa una cantidad válida (mínimo 1)';
      setError(msg);
      setToast({ open: true, type: 'error', message: msg });
      return;
    }
    if (n > MAX_ENTRADAS) {
      const msg = `No puedes comprar más de ${MAX_ENTRADAS} entradas`;
      setError(msg);
      setToast({ open: true, type: 'error', message: msg });
      return;
    }

    // Validación cliente: no permitir más de MAX_ENTRADAS
    if (entradas.length > MAX_ENTRADAS) {
      const msg = `No puedes comprar más de ${MAX_ENTRADAS} entradas`;
      setError(msg);
      return;
    }

    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const msg = 'Por favor ingresa un email válido';
      setError(msg);
      return;
    }

    // Validar cada entrada: nombre y fecha_uso obligatorios
    const missing = [];
    entradas.forEach((e, i) => {
      if (!e.nombre || !e.nombre.trim()) missing.push(`Entrada ${i + 1}: falta nombre`);
      if (!e.fecha_uso || !e.fecha_uso.trim()) missing.push(`Entrada ${i + 1}: falta fecha de uso`);
    });
    if (missing.length) {
      const msg = missing.join(' · ');
      setError(msg);
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    // Mock pago
    setTimeout(async () => {
      try {
        await axios.post("http://localhost:5000/api/entradas", {
          entradas,
          email,
        });
  const ok = "Compra registrada y mail enviado!";
  setSuccess(ok);
      } catch (error) {
        console.error(error);
        const msg = error?.response?.data?.error || 'Error al procesar la compra';
        setError(msg);
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="compra-container">
      <div className="brand-header" aria-label="Eco park header">
        <div className="brand-emoji" aria-hidden>🌳</div>
        <h1 className="brand-title">Eco park</h1>
      </div>

      <h2>Comprar Entradas</h2>

      <div className="field">
        <label htmlFor="email">Correo del comprador</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
        />
      </div>

      <div className="field">
        <label htmlFor="cantidad">Cantidad de entradas</label>
        <input
          id="cantidad"
          type="number"
          step={1}
          value={cantidad}
          onChange={handleCantidadChange}
        />
      </div>

      {entradas.map((entrada, idx) => (
        <div key={idx} className="entrada-card">
          <h4>Entrada {idx + 1}</h4>
          <div className="field">
            <label>Nombre del usuario</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={entrada.nombre}
              onChange={(e) => handleEntradaChange(idx, "nombre", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Fecha de uso de la entrada</label>
            <input
              type="date"
              value={entrada.fecha_uso}
              onChange={(e) =>
                handleEntradaChange(idx, "fecha_uso", e.target.value)
              }
            />
          </div>
        </div>
      ))}

  {error && <p className="error-message">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Procesando pago..." : "Pagar"}
      </button>

      {success && (
        <div className="success-wrap">
          <div className="checkmark">
            <svg viewBox="0 0 52 52">
              <path d="M14 27 l10 10 l18 -22" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="success-message">{success}</p>
        </div>
      )}

      {/* Toast popup for entries feedback */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ open: false, type: 'error', message: '' })}
      />

      {/* Popup removed — errors and success are shown inline */}
    </div>
  );
}

export default CompraEntradas;
