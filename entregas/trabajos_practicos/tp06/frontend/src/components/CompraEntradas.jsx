import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CompraEntradas.css";
import "./Toast.css";
import { useAuth } from "../context/AuthContext";

function CompraEntradas() {
  // Precios
  const PRECIO_REGULAR = 5000;
  const PRECIO_VIP = 10000;

  function calcularPrecio(edad, tipo) {
    if (parseInt(edad) < 3) return 0;
    let base = tipo === "vip" ? PRECIO_VIP : PRECIO_REGULAR;
    if (parseInt(edad) < 15 || parseInt(edad) >= 60) return base / 2;
    return base;
  }
  const [formaPago, setFormaPago] = useState("efectivo");
  const [mostrarSimulacion, setMostrarSimulacion] = useState(false);
  const [cantidad, setCantidad] = useState("1");
  const [entradas, setEntradas] = useState([{ nombre: "", fecha_uso: "", edad: "", tipo: "regular" }]);
  const [email, setEmail] = useState("");
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const MAX_ENTRADAS = 10;

  const [errorGlobal, setErrorGlobal] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  
  const [pagoExitoso, setPagoExitoso] = useState(false);

  const handleCantidadChange = (e) => {
    if (fieldErrors.cantidad) {
      setFieldErrors(prev => ({ ...prev, cantidad: undefined }));
    }

    const raw = e.target.value;
    if (raw === "") {
      setCantidad("");
      setFieldErrors(prev => ({ ...prev, cantidad: "Ingresa una cantidad" }));
      return;
    }
    if (!/^\d+$/.test(raw)) {
      return; 
    }
    const n = parseInt(raw, 10);
    setCantidad(raw);

    if (n > MAX_ENTRADAS) {
      const msg = `No puedes comprar más de ${MAX_ENTRADAS} entradas`;
      setFieldErrors(prev => ({ ...prev, cantidad: msg }));
    } else if (n < 1) {
      const msg = "La cantidad debe ser al menos 1";
      setFieldErrors(prev => ({ ...prev, cantidad: msg }));
    }
    
    const renderCount = Math.max(1, Math.min(n, MAX_ENTRADAS));
    const newEntradas = [];
    for (let i = 0; i < renderCount; i++) {
      newEntradas.push(entradas[i] || { nombre: "", fecha_uso: "", edad: "", tipo: "regular" });
    }
    setEntradas(newEntradas);
  };

  const handleEntradaChange = (index, field, value) => {
    const newEntradas = [...entradas];
    newEntradas[index][field] = value;
    setEntradas(newEntradas);

    const errorKey = `entrada_${index}_${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    // If user is logged in, keep their email as purchaser email; otherwise clear
    setEmail(user?.email || "");
    setCantidad("1");
    setEntradas([{ nombre: "", fecha_uso: "", edad: "", tipo: "regular" }]);
    setFormaPago("efectivo");
    setErrorGlobal("");
    setFieldErrors({});
  };

  // Keep email in sync with logged in user
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    } else {
      // only clear if email was previously empty or not coming from user
      // don't override a manually typed email if user is not authenticated
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    const fechasNoPermitidas = ["12-25", "01-01"];
    const diasAbiertos = [0, 2, 3, 4, 5, 6];

    // 1. Validar Email
    if (!email) {
      newErrors.email = "Debes ingresar un correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "El formato del correo no es válido.";
    }

    // 2. Validar Cantidad
    const n = parseInt(cantidad, 10);
    if (isNaN(n) || n < 1) {
      newErrors.cantidad = "La cantidad debe ser al menos 1.";
    } else if (n > MAX_ENTRADAS) {
      newErrors.cantidad = `No puedes comprar más de ${MAX_ENTRADAS} entradas.`;
    }

    // 3. Validar cada entrada
    entradas.forEach((entrada, i) => {
      if (!entrada.nombre || !String(entrada.nombre).trim()) {
        newErrors[`entrada_${i}_nombre`] = "Nombre requerido";
      }
      if (!entrada.edad || isNaN(parseInt(entrada.edad)) || parseInt(entrada.edad) < 0) {
        newErrors[`entrada_${i}_edad`] = "Edad requerida";
      }
      if (!entrada.fecha_uso) {
        newErrors[`entrada_${i}_fecha_uso`] = "Fecha requerida";
      } else {
        const fecha = new Date(entrada.fecha_uso + "T00:00:00");
        if (isNaN(fecha.getTime())) {
          newErrors[`entrada_${i}_fecha_uso`] = "La fecha no es válida";
        } else {
          const mmdd = entrada.fecha_uso.slice(5);
          if (fechasNoPermitidas.includes(mmdd)) {
            newErrors[`entrada_${i}_fecha_uso`] = `La fecha ${entrada.fecha_uso} no está permitida`;
          }
          const diaSemana = fecha.getDay();
          if (!diasAbiertos.includes(diaSemana)) {
            newErrors[`entrada_${i}_fecha_uso`] = "El parque está cerrado ese día";
          }
        }
      }
    });

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    setErrorGlobal("");
    if (!validateForm()) {
      return;
    }

    if (formaPago === "tarjeta") {
      setMostrarSimulacion(true);
      return;
    }

    setLoading(true);
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/api/entradas", { entradas, email });
      setSuccess("Compra registrada y mail enviado!");
      resetForm();
    } catch (error) {
      setErrorGlobal(error?.response?.data?.error || 'Error al procesar la compra');
    }
    setLoading(false);
  };

  const handleFinalizarPago = async () => {
    if (!validateForm()) {
      setMostrarSimulacion(false);
      return;
    }

    setLoading(true);
    setSuccess("");
    setErrorGlobal("");
    try {
      await axios.post("http://localhost:5000/api/entradas", { entradas, email });
      setMostrarSimulacion(false);
      setPagoExitoso(true);
      
      setTimeout(() => {
        setPagoExitoso(false);
      }, 5000);

      
  setEmail(user?.email || "");
      setCantidad("1");
      setEntradas([{ nombre: "", fecha_uso: "", edad: "", tipo: "regular" }]);
      setFormaPago("efectivo");
      setFieldErrors({});

    } catch (error) {
      const errorMsg = error?.response?.data?.error || 'Error al procesar la compra';
      setErrorGlobal(errorMsg);
    }
    setLoading(false);
  };


  return (
    <div className="compra-container">
      
      {pagoExitoso && (
        <div className="mensaje-exito-visible">
          <p>¡Listo! Tu pago se realizó con éxito.</p>
        </div>
      )}
      
      {mostrarSimulacion ? (
        <div className="mp-pagina-simulacion"> 
          <div className="modal-header">
            <img 
              src={require('../imagenes/logomercado.png')}
              alt="Mercado Pago" 
            />
          </div>
          <div className="modal-body">
            <p>Resumen de compra:</p>
            <ul className="modal-resumen-lista">
              {entradas.map((e, idx) => (
                <li key={idx}>
                  <strong>{e.nombre}</strong> ({e.tipo}) - ${calcularPrecio(e.edad, e.tipo)}
                </li>
              ))}
            </ul>
            <p className="modal-total">
              <strong>Total a pagar: ${entradas.reduce((acc, e) => acc + calcularPrecio(e.edad, e.tipo), 0)}</strong>
            </p>
            <button 
              className="boton-mp" 
              onClick={handleFinalizarPago}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Finalizar Pago"}
            </button>
            <button 
              className="boton-cancelar-mp"
              onClick={() => {
                setMostrarSimulacion(false);
                setErrorGlobal("");
                setFieldErrors({});
              }}
              disabled={loading}
            >
              Cancelar
            </button>
            {errorGlobal && <p className="error-message-modal">{errorGlobal}</p>}
          </div>
        </div>
      ) : (
        <>
          <h2>Comprar Entradas</h2>
          <div className="field">
            <label htmlFor="email">Correo del comprador</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              placeholder={user?.email || "ejemplo@correo.com"}
              disabled={isAuthenticated}
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <p className="error-message-field">{fieldErrors.email}</p>}
            {isAuthenticated && <p className="help-text">Usaremos el correo con el que iniciaste sesión: <strong>{user?.email}</strong></p>}
          </div>

          <div className="field">
            <label>Forma de pago</label>
            <div className="radio-group horizontal">
              <label>
                <input
                  type="radio"
                  name="formaPago"
                  value="efectivo"
                  checked={formaPago === "efectivo"}
                  onChange={e => setFormaPago(e.target.value)}
                />
                Efectivo (boletería)
              </label>
              <label>
                <input
                  type="radio"
                  name="formaPago"
                  value="tarjeta"
                  checked={formaPago === "tarjeta"}
                  onChange={e => setFormaPago(e.target.value)}
                />
                Tarjeta de crédito (Mercado Pago)
              </label>
            </div>
          </div>

          <div className="field">
            <label htmlFor="cantidad">Cantidad de entradas</label>
            <input
              id="cantidad"
              type="number"
              step={1}
              value={cantidad}
              onChange={handleCantidadChange}
              className={fieldErrors.cantidad ? 'input-error' : ''}
            />
            {fieldErrors.cantidad && <p className="error-message-field">{fieldErrors.cantidad}</p>}
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
                  className={fieldErrors[`entrada_${idx}_nombre`] ? 'input-error' : ''}
                />
                {fieldErrors[`entrada_${idx}_nombre`] && <p className="error-message-field">{fieldErrors[`entrada_${idx}_nombre`]}</p>}
              </div>
              
              <div className="field">
                <label>Fecha de uso de la entrada</label>
                <input
                  type="date"
                  value={entrada.fecha_uso}
                  onChange={(e) => handleEntradaChange(idx, "fecha_uso", e.target.value)}
                  className={fieldErrors[`entrada_${idx}_fecha_uso`] ? 'input-error' : ''}
                />
                {fieldErrors[`entrada_${idx}_fecha_uso`] && <p className="error-message-field">{fieldErrors[`entrada_${idx}_fecha_uso`]}</p>}
              </div>

              <div className="field">
                <label>Edad del visitante</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Edad"
                  value={entrada.edad}
                  onChange={(e) => handleEntradaChange(idx, "edad", e.target.value)}
                  className={fieldErrors[`entrada_${idx}_edad`] ? 'input-error' : ''}
                />
                {fieldErrors[`entrada_${idx}_edad`] && <p className="error-message-field">{fieldErrors[`entrada_${idx}_edad`]}</p>}
              </div>

              <div className="field">
                <label>Tipo de pase</label>
                <select
                  className="select-tipo-pase"
                  value={entrada.tipo}
                  onChange={(e) => handleEntradaChange(idx, "tipo", e.target.value)}
                >
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
          ))}
          
          {errorGlobal && !mostrarSimulacion && <p className="error-message">{errorGlobal}</p>}
          
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Procesando..." : "Pagar"}
          </button>
          
          {success && (
            <div className="success-wrap">
              <div className="checkmark">
                <svg viewBox="0 0 52 52">
                  <path d="M14 27 l10 10 l18 -22" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="success-message">{success}</p>
              <p>Cantidad de entradas compradas: {cantidad}</p>
              <p>Fecha de visita: {entradas[0]?.fecha_uso}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CompraEntradas;