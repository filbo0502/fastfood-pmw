import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createOrder, updateOrderStatus, getUserOrders } from '../controllers/orderController.js';

const router = express.Router();

router.get('/user', authMiddleware, getUserOrders);

router.post('/', authMiddleware, createOrder);

router.put('/:id/status', authMiddleware, updateOrderStatus);

export default router;