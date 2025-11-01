// src/api/routes/catalogoRoutes.js
import { Router } from 'express';
import { obtenerProductos, pingCatalogo, diagnosticoCatalogo } from '../controllers/catalogoController.js';

const router = Router();

router.get('/', obtenerProductos);       // /api/catalogo
router.get('/test', pingCatalogo);       // /api/catalogo/test
router.get('/diag', diagnosticoCatalogo);// /api/catalogo/diag

export default router;
