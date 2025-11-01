import express from "express";
import { obtenerCarrito, agregarAlCarrito, vaciarCarrito } from "../controllers/carritoController.js";

const router = express.Router();

router.get("/", obtenerCarrito);
router.post("/", agregarAlCarrito);
router.delete("/", vaciarCarrito);

export default router;
