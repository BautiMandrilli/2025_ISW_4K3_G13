import React, { useState } from "react";
import axios from "axios";
import "./CompraEntradas.css";
import "./Toast.css";
import { useAuth } from "../context/AuthContext";

function CompraEntradas() {
  // Mensaje personalizado para animación de éxito
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [successAnimMsg, setSuccessAnimMsg] = useState("");
  // Precios
  const PRECIO_REGULAR = 5000;
  const PRECIO_VIP = 10000;

  function calcularPrecio(edad, tipo) {
    if (parseInt(edad) < 3) return 0;
    let base = tipo === "vip" ? PRECIO_VIP : PRECIO_REGULAR;
    if (parseInt(edad) < 15 || parseInt(edad) >= 60) return base / 2;
    return base;
  }
  const { user } = useAuth();
  // const [formaPago, setFormaPago] = useState("efectivo");
  const [formaPago, setFormaPago] = useState(""); // No hay valor por defecto
  const [mostrarSimulacion, setMostrarSimulacion] = useState(false);
  const [mostrarReserva, setMostrarReserva] = useState(false);
  const [cantidad, setCantidad] = useState("1");
  const [entradas, setEntradas] = useState([{ nombre: "", fecha_uso: "", edad: "", tipo: "regular" }]);
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
    setCantidad("1");
    setEntradas([{ nombre: "", fecha_uso: "", edad: "", tipo: "regular" }]);
    setFormaPago("efectivo");
    setErrorGlobal("");
    setFieldErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const fechasNoPermitidas = ["12-25", "01-01"];
    const diasAbiertos = [0, 2, 3, 4, 5, 6];

    // 1. Validar Email (ya no se pide, pero validamos que user.email exista)
    if (!user?.email) {
      newErrors.email = "No se detectó un correo de usuario autenticado.";
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
          // Validar fecha pasada
          const hoy = new Date();
          hoy.setHours(0,0,0,0);
          if (fecha < hoy) {
            newErrors[`entrada_${i}_fecha_uso`] = "No se puede seleccionar una fecha pasada";
          }
          const mmdd = entrada.fecha_uso.slice(5);
          if (fechasNoPermitidas.includes(mmdd)) {
            newErrors[`entrada_${i}_fecha_uso`] = `El parque esta cerrado el dia ${entrada.fecha_uso}`;
          }
          const diaSemana = fecha.getDay();
          if (!diasAbiertos.includes(diaSemana)) {
            newErrors[`entrada_${i}_fecha_uso`] = "El parque está cerrado los lunes";
          }
        }
      }
    });

    // Validar forma de pago
    if (!formaPago) {
      newErrors.formaPago = "Debes seleccionar una forma de pago.";
    }

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

    if (formaPago === "efectivo") {
      setMostrarReserva(true);
      return;
    }

    setLoading(true);
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/api/entradas", { entradas, email: user.email }); // usar user.email
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
      await axios.post("http://localhost:5000/api/entradas", { entradas, email: user.email }); // usar user.email
      setMostrarSimulacion(false);
      setPagoExitoso(true);
      setShowSuccessAnim(true);
      setSuccessAnimMsg("Revisá tu correo electrónico con la información de las entradas.");
      setTimeout(() => {
        setPagoExitoso(false);
        setShowSuccessAnim(false);
        setSuccessAnimMsg("");
  }, 5000);

      
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

  const handleConfirmarReserva = async () => {
    if (!validateForm()) {
      setMostrarReserva(false);
      return;
    }

    setLoading(true);
    setSuccess("");
    setErrorGlobal("");
    try {
      await axios.post("http://localhost:5000/api/entradas", { entradas, email: user.email });
      setMostrarReserva(false);
      setSuccess("");
      setPagoExitoso(true);
      setShowSuccessAnim(true);
      setSuccessAnimMsg("Debés pasar por boletería para abonar y retirar tus entradas.");
      setCantidad("1");
      setEntradas([{ nombre: "", fecha_uso: "", edad: "", tipo: "regular" }]);
      setFormaPago("efectivo");
      setFieldErrors({});
      setTimeout(() => {
        setPagoExitoso(false);
        setShowSuccessAnim(false);
        setSuccessAnimMsg("");
      }, 3000);
    } catch (error) {
      const errorMsg = error?.response?.data?.error || 'Error al procesar la reserva';
      setErrorGlobal(errorMsg);
    }
    setLoading(false);
  };


  return (
    <div className="compra-container">
      {showSuccessAnim && (
        <div className="ml-success-overlay">
          <div className="ml-checkmark">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="38" fill="#fff" stroke="#2ecc40" strokeWidth="4" />
              <polyline
                className="ml-checkmark-path"
                points="24,44 37,57 58,32"
                fill="none"
                stroke="#2ecc40"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="ml-success-content">
            <h1>¡Compra realizada con éxito!</h1>
            <p>{successAnimMsg}</p>
          </div>
        </div>
      )}
      {/* El resto del render se mantiene igual, pero el bloque de success/reserva ya no se muestra */}
      {mostrarSimulacion ? (
        <div className="mp-pagina-simulacion"> 
          <div className="modal-header">
            <img 
              src={require('../imagenes/logomercado.png')}
              alt="Mercado Pago" 
            />
          </div>
          <div className="modal-body">
            <p style={{marginBottom:'12px'}}>Resumen de compra con Mercado Pago:</p>
            <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'16px'}}>
              <thead>
                <tr style={{background:'#f2f6fa'}}>
                  <th style={{padding:'6px', borderRadius:'4px'}}>Nombre</th>
                  <th style={{padding:'6px'}}>Tipo</th>
                  <th style={{padding:'6px'}}>Edad</th>
                  <th style={{padding:'6px'}}>Fecha</th>
                  <th style={{padding:'6px'}}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((e, idx) => (
                  <tr key={idx} style={{textAlign:'center', background: idx%2===0?'#fff':'#f9f9f9'}}>
                    <td style={{padding:'6px'}}>{e.nombre}</td>
                    <td style={{padding:'6px'}}>{e.tipo}</td>
                    <td style={{padding:'6px'}}>{e.edad}</td>
                    <td style={{padding:'6px'}}>{e.fecha_uso}</td>
                    <td style={{padding:'6px', fontWeight:'bold'}}>${calcularPrecio(e.edad, e.tipo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="modal-total" style={{marginTop:'24px', fontSize:'1.1em', textAlign:'right'}}>
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
                style={{backgroundColor:'#c0392b', color:'#fff'}}
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
      ) : mostrarReserva ? (
        <div className="reserva-modal">
          <div className="modal-header" style={{justifyContent:'center'}}>
            <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>Resumen de Reserva</span>
          </div>
          <div className="modal-body">
            <p style={{marginBottom:'12px'}}>Su boleto ha sido reservado. Deberá abonar el dinero en efectivo en boletería.</p>
            <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'16px'}}>
              <thead>
                <tr style={{background:'#f2f6fa'}}>
                  <th style={{padding:'6px', borderRadius:'4px'}}>Nombre</th>
                  <th style={{padding:'6px'}}>Tipo</th>
                  <th style={{padding:'6px'}}>Edad</th> 
                  <th style={{padding:'6px'}}>Fecha</th>
                  <th style={{padding:'6px'}}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((e, idx) => (
                  <tr key={idx} style={{textAlign:'center', background: idx%2===0?'#fff':'#f9f9f9'}}>
                    <td style={{padding:'6px'}}>{e.nombre}</td>
                    <td style={{padding:'6px'}}>{e.tipo}</td>
                    <td style={{padding:'6px'}}>{e.edad}</td>
                    <td style={{padding:'6px'}}>{e.fecha_uso}</td>
                    <td style={{padding:'6px', fontWeight:'bold'}}>${calcularPrecio(e.edad, e.tipo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="modal-total" style={{marginTop:'24px', fontSize:'1.1em', textAlign:'right'}}>
              <strong>Total a abonar: ${entradas.reduce((acc, e) => acc + calcularPrecio(e.edad, e.tipo), 0)}</strong>
            </p>
            <div style={{display:'flex', flexDirection:'column', gap:'6px', marginTop:'16px', alignItems:'center', width:'100%'}}>
              <button
                className="boton-confirmar-reserva"
                style={{width:'90%', padding:'14px 0', fontSize:'1.08em', fontWeight:'bold', borderRadius:'8px'}}
                onClick={handleConfirmarReserva}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Confirmar Reserva"}
              </button>
                <button
                  className="boton-cancelar-mp"
                  style={{width:'90%', padding:'12px 0', fontSize:'1em', borderRadius:'8px', backgroundColor:'#c0392b', color:'#fff'}}
                  onClick={() => {
                    setMostrarReserva(false);
                    setErrorGlobal("");
                    setFieldErrors({});
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
            </div>
            {errorGlobal && <p className="error-message-modal">{errorGlobal}</p>}
          </div>
        </div>
      ) : (
        <>
          <h2>Comprar Entradas</h2>

          <div className="field">
            <label>Correo del comprador</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              readOnly
              style={{ background: "#f5f5f5", color: "#888" }}
            />
          </div>

          <div className="field">
            <label>Forma de pago</label>
            <select
              className="select-tipo-pase"
              value={formaPago}
              onChange={e => setFormaPago(e.target.value)}
            >
              <option value="" disabled>Seleccionar forma de pago</option>
              <option value="efectivo">Efectivo (boletería)</option>
              <option value="tarjeta">Tarjeta de crédito (Mercado Pago)</option>
            </select>
            {fieldErrors.formaPago && <p className="error-message-field">{fieldErrors.formaPago}</p>}
          </div>

          <div className="field">
            <label htmlFor="cantidad">Cantidad de entradas</label>
            <input
              id="cantidad"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={cantidad}
              onChange={handleCantidadChange}
              className={fieldErrors.cantidad ? 'input-error' : ''}
              onKeyDown={e => {
                if (
                  ["e", "E", ".", ","].includes(e.key) ||
                  (!/^[0-9]$/.test(e.key) && e.key.length === 1)
                ) {
                  e.preventDefault();
                }
              }}
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max="120"
                  placeholder="Edad"
                  value={entrada.edad}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9]/g, "");
                    // Permitir vacío o número entre 1 y 120
                    if (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 120)) {
                      handleEntradaChange(idx, "edad", val);
                    }
                  }}
                  className={fieldErrors[`entrada_${idx}_edad`] ? 'input-error' : ''}
                  onKeyDown={e => {
                    if (["e", "E", ".", ",", "-", "+", "*", "/"].includes(e.key) || (!/^[0-9]$/.test(e.key) && e.key.length === 1)) {
                      e.preventDefault();
                    }
                  }}
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
          
          
        </>
      )}
    </div>
  );
}

export default CompraEntradas;