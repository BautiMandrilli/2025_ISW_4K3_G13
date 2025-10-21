const express = require("express");
const nodemailer = require("nodemailer");
const db = require("./database/db.js");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// JWT Secret key (en producción debería estar en .env)
const JWT_SECRET = process.env.JWT_SECRET || "ecopark_secret_key_2024";

// Config Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. No se proporcionó token." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Token inválido." });
  }
};

// Endpoint para registro de usuarios
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Validaciones básicas
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  try {
    // Verificar si el usuario ya existe
    const checkUser = new Promise((resolve, reject) => {
      db.get("SELECT * FROM usuarios WHERE email = ? OR username = ?", [email, username], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    const existingUser = await checkUser;
    if (existingUser) {
      return res.status(400).json({ error: "El usuario o email ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const insertUser = new Promise((resolve, reject) => {
      const stmt = db.prepare("INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)");
      stmt.run(username, email, hashedPassword, function(err) {
        stmt.finalize();
        if (err) reject(err);
        resolve(this.lastID);
      });
    });

    const userId = await insertUser;

    // Generar token
    const token = jwt.sign(
      { userId: userId, username: username, email: email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token: token,
      user: { id: userId, username: username, email: email }
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para login de usuarios
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    // Buscar usuario
    const getUser = new Promise((resolve, reject) => {
      db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    const user = await getUser;
    if (!user) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login exitoso",
      token: token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para obtener perfil del usuario (protegido)
app.get("/api/auth/profile", verifyToken, (req, res) => {
  res.json({
    user: {
      id: req.user.userId,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// Endpoint para registrar entradas (protegido)
app.post("/api/entradas", verifyToken, async (req, res) => {
  console.log("💡 Llega request:", req.body);
  const { entradas, email } = req.body;
  const MAX_ENTRADAS = 10;
  // Validaciones básicas
  if (!entradas || !Array.isArray(entradas) || entradas.length === 0) {
    return res.status(400).json({ error: "Datos incompletos: no hay entradas" });
  }
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: "Datos incompletos: falta email" });
  }
  if (entradas.length > MAX_ENTRADAS) {
    return res.status(400).json({ error: `No puedes comprar más de ${MAX_ENTRADAS} entradas` });
  }
  // Validador de email simple
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }
  // Validar cada entrada
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const missing = [];
  entradas.forEach((e, i) => {
    if (!e || typeof e !== 'object') missing.push(`Entrada ${i+1}: estructura inválida`);
    else {
      if (!e.nombre || !String(e.nombre).trim()) missing.push(`Entrada ${i+1}: falta nombre`);
      if (!e.fecha_uso || !dateRe.test(String(e.fecha_uso))) missing.push(`Entrada ${i+1}: fecha inválida (usar YYYY-MM-DD)`);
      if (!e.edad || isNaN(parseInt(e.edad))) missing.push(`Entrada ${i+1}: falta edad válida`);
      if (!e.tipo || (e.tipo !== "vip" && e.tipo !== "regular")) missing.push(`Entrada ${i+1}: falta tipo de pase`);
    }
  });
  if (missing.length) {
    return res.status(400).json({ error: missing.join(' · ') });
  }

  const runInsert = (entrada) => new Promise((resolve, reject) => {
    const stmt = db.prepare("INSERT INTO entradas (nombre, fecha_uso_entrada, email, edad, tipo) VALUES (?, ?, ?, ?, ?)");
    stmt.run(entrada.nombre, entrada.fecha_uso, email, entrada.edad, entrada.tipo, function(err) {
      stmt.finalize();
      if (err) {
        console.error("Error al insertar en DB:", err);
        return reject(err);
      }
      resolve(this.lastID);
    });
  });
  const insertedIds = [];
  try {
    for (let entrada of entradas) {
      console.log("Insertando entrada:", entrada);
      const id = await runInsert(entrada);
      insertedIds.push(id);
    }
  } catch (dbError) {
    return res.status(500).json({ error: "Error al registrar en la base de datos" });
  }

  try {
    console.log("Enviando mail a:", email);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmación de compra de entradas",
      html: `<h2>Compra exitosa</h2>
              <p>Gracias por tu compra. Las entradas registradas son:</p>
              <ul>
              ${entradas.map((e, index) => {
                const codigoEntrada = insertedIds[index];
                
                return (`
                  <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <strong>Código de entrada: ${codigoEntrada}</strong><br>
                    Nombre: ${e.nombre}<br>
                    Fecha de uso: ${e.fecha_uso}<br>
                    Edad: ${e.edad}<br>
                    Pase: ${e.tipo.toUpperCase()}
                  </li>
                `);
              }).join("")}
              </ul>`,
    });
    
    res.json({ message: "Compra registrada y mail enviado correctamente", ids: insertedIds });

  } catch (mailError) {
    
    console.error("Error al enviar el mail (pero la compra SÍ se guardó):", mailError);
    
    res.json({ 
      message: "Compra registrada (pero hubo un problema al enviar el mail)", 
      ids: insertedIds 
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
