// src/api/routes/paypalRoutes.js
import express from 'express';
import { crearOrdenPayPal } from '../controllers/paypalController.js';
const router = express.Router();

router.post('/orden', crearOrdenPayPal);
export default router;
