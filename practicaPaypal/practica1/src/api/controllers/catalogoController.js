// src/api/controllers/catalogoController.js
import db from '../config/db.js';

// GET /api/catalogo
export const obtenerProductos = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, descripcion, precio, imagen, stock, categoria_id, activo
       FROM productos
       WHERE activo = 1`
    );
    return res.json(rows);
  } catch (e) {
    console.error('❌ /api/catalogo DB_ERROR:', e);
    return res.status(500).json({ error: 'DB_ERROR', code: e.code, message: e.message });
  }
};

// GET /api/catalogo/test
export const pingCatalogo = (_req, res) => {
  return res.json({ ok: true });
};

// GET /api/catalogo/diag
export const diagnosticoCatalogo = async (_req, res) => {
  try {
    const [[dbName]] = await db.query('SELECT DATABASE() AS db');
    const [tables] = await db.query('SHOW TABLES');
    const [[count]] = await db.query('SELECT COUNT(*) AS total FROM productos');
    return res.json({ db: dbName.db, tables, productos: count.total });
  } catch (e) {
    console.error('❌ /api/catalogo/diag error:', e);
    return res.status(500).json({ error: 'DIAG_ERROR', code: e.code, message: e.message });
  }
};
