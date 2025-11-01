// src/api/controllers/paypalController.js
// ✅ Sin "node-fetch": en Node 18+ fetch es global

export const crearOrdenPayPal = async (req, res) => {
  try {
    const { total } = req.body ?? {};
    if (typeof total !== 'number' || !isFinite(total) || total <= 0) {
      return res.status(400).json({ error: 'Total inválido' });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret   = process.env.PAYPAL_SECRET;
    if (!clientId || !secret) {
      return res.status(500).json({ error: 'Faltan credenciales de PayPal en .env' });
    }

    // 1) OAuth token
    const authResp = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResp.ok) {
      const t = await safeJson(authResp);
      return res.status(502).json({ error: 'OAuth PayPal falló', detail: t });
    }

    const { access_token } = await authResp.json();

    // 2) Crear orden
    const orderResp = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'MXN',
              value: total.toFixed(2),
            },
          },
        ],
      }),
    });

    const orderData = await safeJson(orderResp);

    if (!orderResp.ok) {
      return res.status(502).json({ error: 'Crear orden PayPal falló', detail: orderData });
    }

    return res.json(orderData);
  } catch (err) {
    console.error('PayPal error:', err);
    return res.status(500).json({ error: 'Error al crear la orden PayPal' });
  }
};

// Utilidad para intentar parsear JSON aun cuando PayPal responda con error
async function safeJson(resp) {
  try {
    return await resp.json();
  } catch {
    return await resp.text().catch(() => '(sin cuerpo)');
  }
}
