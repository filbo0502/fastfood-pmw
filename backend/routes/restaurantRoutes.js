import express from 'express';
import { authMiddleware, authRestaurateurMiddleware } from '../middlewares/authMiddleware.js';
import { getAllRestaurants, getRestaurant, getMyRestaurant, getRestaurantMenu, updateRestaurant, deleteRestaurant, addOrUpdateMealInMenu, deleteMealFromMenu, getRestaurantOrders, searchRestaurant } from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/', authMiddleware, getAllRestaurants);

router.get('/search', authMiddleware, searchRestaurant);

router.get('/my-restaurant', authMiddleware, authRestaurateurMiddleware, getMyRestaurant);

router.get('/:id', authMiddleware, getRestaurant);

router.get('/:id/menu', authMiddleware, getRestaurantMenu);

router.get('/:id/orders', authMiddleware, authRestaurateurMiddleware, getRestaurantOrders);

router.put('/:id', authMiddleware, authRestaurateurMiddleware, updateRestaurant);

router.delete('/:id', authMiddleware, authRestaurateurMiddleware, deleteRestaurant);

router.post('/:id/menu', authMiddleware, authRestaurateurMiddleware, addOrUpdateMealInMenu);

router.delete('/:id/menu/:idMeal', authMiddleware, authRestaurateurMiddleware, deleteMealFromMenu);

export default router;