import db from "../config/db.js";

// GET /api/carrito
export const obtenerCarrito = (req, res) => {
  db.query(
    `SELECT c.id, p.id AS producto_id, p.nombre, p.precio, p.imagen, c.cantidad, c.total 
     FROM carrito c 
     JOIN productos p ON c.producto_id = p.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error al obtener el carrito" });
      res.json(results);
    }
  );
};

// POST /api/carrito
export const agregarAlCarrito = (req, res) => {
  const { producto_id, cantidad } = req.body;
  if (!producto_id || !cantidad || cantidad <= 0)
    return res.status(400).json({ error: "Datos inválidos" });

  db.query("SELECT precio, stock FROM productos WHERE id = ? AND activo=1", [producto_id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error interno" });
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const { precio, stock } = rows[0];
    if (stock < cantidad) return res.status(409).json({ error: "Stock insuficiente" });

    const total = (+precio) * (+cantidad);

    db.query(
      "INSERT INTO carrito (producto_id, cantidad, total) VALUES (?, ?, ?)",
      [producto_id, cantidad, total],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Error al agregar al carrito" });
        res.json({ message: "Producto agregado al carrito" });
      }
    );
  });
};

// DELETE /api/carrito
export const vaciarCarrito = (req, res) => {
  db.query("DELETE FROM carrito", (err) => {
    if (err) return res.status(500).json({ error: "Error al vaciar carrito" });
    res.json({ message: "Carrito vaciado" });
  });
};
