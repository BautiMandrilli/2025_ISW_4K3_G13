const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Usar el directorio actual del módulo como carpeta de la DB
const dbDir = __dirname; // .../backend/database

// Ruta completa al archivo de la DB (archivo dentro de backend/database)
const dbPath = path.join(dbDir, "ecoParkDB.db");

// Debug: imprimir ruta y si existe
console.log('[db] ruta de la DB ->', dbPath);
console.log('[db] existe DB?:', fs.existsSync(dbPath));

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al abrir la DB:", err.message);
  } else {
    console.log("Base de datos SQLite abierta ✅");
  }
});

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS entradas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      fecha_uso_entrada TEXT NOT NULL,
      email TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'general'
    )
  `);
});

module.exports = db;
