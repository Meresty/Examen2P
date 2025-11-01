// src/api/controllers/checkoutController.js
import db from '../config/db.js';

// ÚNICA exportación de checkout
export const checkout = async (req, res) => {
  const { items = [], total = 0 } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items vacíos' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // crea pedido
    const [pedidoRes] = await conn.query(
      'INSERT INTO pedidos (total, estado, creado_en) VALUES (?, ?, NOW())',
      [total, 'pagado']
    );
    const pedidoId = pedidoRes.insertId;

    // inserta items y descuenta stock
    for (const it of items) {
      const { producto_id, cantidad } = it;

      const [rows] = await conn.query(
        'SELECT stock FROM productos WHERE id = ? FOR UPDATE',
        [producto_id]
      );
      if (!rows.length) throw new Error(`Producto ${producto_id} no existe`);
      if (rows[0].stock < cantidad) throw new Error(`Stock insuficiente para producto ${producto_id}`);

      await conn.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)',
        [pedidoId, producto_id, cantidad]
      );
      await conn.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [cantidad, producto_id]
      );
    }

    await conn.commit();
    res.json({ ok: true, pedido_id: pedidoId });
  } catch (e) {
    await conn.rollback();
    console.error('Checkout error:', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
};
