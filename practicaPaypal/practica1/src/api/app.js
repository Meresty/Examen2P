import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import catalogoRoutes from './routes/catalogoRoutes.js';
import carritoRoutes from './routes/carritoRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import db from './config/db.js';



dotenv.config({ path: join(process.cwd(), 'src', 'api', '.env') });


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = join(__dirname, '..', '..');

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:4200';
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());


app.use('/images', express.static(join(repoRoot, 'images')));

app.use('/images', express.static(join(repoRoot, 'src', 'assets', 'images')));


app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev' });
});


app.get('/api/diag/check-image', (req, res) => {
  const name = String(req.query.name || '').replace(/^\/+/, '');
  const p1 = join(repoRoot, 'images', name);
  const p2 = join(repoRoot, 'src', 'assets', 'images', name);
  res.json({ requested: name, candidates: [p1, p2] });
});


app.use('/api/catalogo', catalogoRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/checkout', checkoutRoutes);


app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});


app.use((err, _req, res, _next) => {
  console.error('💥 API error:', err?.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});


const PORT = Number(process.env.PORT) || 4000;

const start = async () => {
  try {
    if (typeof db?.query === 'function') {
      await db.query('SELECT 1');
      console.log('✅ MySQL pool OK');
    } else {
      console.log('ℹ db.query no definido (modo sin DB?)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 API lista en http://localhost:${PORT} (CORS: ${FRONTEND_ORIGIN})`);
      console.log('📸 Imágenes servidas en /images desde:');
      console.log(`   - ${join(repoRoot, 'images')}`);
      console.log(`   - ${join(repoRoot, 'src', 'assets', 'images')}`);
    });
  } catch (e) {
    console.error('❌ No se pudo conectar a MySQL:', e?.message || e);
    process.exit(1);
  }
};

start();
