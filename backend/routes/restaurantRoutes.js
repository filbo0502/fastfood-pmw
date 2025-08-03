import express from 'express';
import { authMiddleware, authRestaurateurMiddleware } from '../middlewares/authMiddleware.js';
import { getRestaurant, updateRestaurant, deleteRestaurant, searchRestaurant, addOrUpdateMealInMenu } from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/:id', authMiddleware, getRestaurant);

router.put('/:id', authMiddleware, authRestaurateurMiddleware, updateRestaurant);

router.delete('/:id', authMiddleware, authRestaurateurMiddleware, deleteRestaurant);

router.get('/search', authMiddleware, searchRestaurant);

router.post('/:id/menu', authMiddleware, authRestaurateurMiddleware, addOrUpdateMealInMenu);

export default router;