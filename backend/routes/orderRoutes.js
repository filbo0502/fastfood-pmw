import express from 'express';
import { authMiddleware, authRestaurateurMiddleware } from '../middlewares/authMiddleware.js';
import { createOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', authMiddleware, createOrder)

export default router;