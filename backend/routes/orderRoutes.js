import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getAllOrders, createOrder, updateOrderStatus, deleteOrder, getUserOrders, getUserOrderHistory } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', authMiddleware, getAllOrders);

router.get('/user', authMiddleware, getUserOrders);

router.get('/history', authMiddleware, getUserOrderHistory);

router.post('/', authMiddleware, createOrder);

router.put('/:id/status', authMiddleware, updateOrderStatus);

router.delete('/:id', authMiddleware, deleteOrder);

export default router;