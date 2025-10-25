import express from 'express';
import { authMiddleware, authRestaurateurMiddleware } from '../middlewares/authMiddleware.js';
import { getRestaurantStats } from '../controllers/statisticsController.js';

const router = express.Router();

router.get('/:id', authMiddleware, authRestaurateurMiddleware, getRestaurantStats);

export default router;

