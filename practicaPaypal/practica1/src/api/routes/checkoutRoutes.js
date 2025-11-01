// src/api/routes/checkoutRoutes.js
import { Router } from 'express';
import { checkout } from '../controllers/checkoutController.js';

const router = Router();
router.post('/', checkout);

export default router;
