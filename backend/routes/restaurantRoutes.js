import express from 'express';
import { authMiddleware, authRestaurateurMiddleware } from '../middlewares/authMiddleware.js';
import { getAllRestaurants, getRestaurant, getRestaurantMenu, updateRestaurant, deleteRestaurant, searchRestaurant, addOrUpdateMealInMenu, deleteMealFromMenu, searchRestaurantsByDish, getRestaurantStatistics } from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/', authMiddleware, getAllRestaurants);

router.get('/:id', authMiddleware, getRestaurant);

router.get('/:id/menu', authMiddleware, getRestaurantMenu);

router.get('/:id/statistics', authMiddleware, authRestaurateurMiddleware, getRestaurantStatistics);

router.put('/:id', authMiddleware, authRestaurateurMiddleware, updateRestaurant);

router.delete('/:id', authMiddleware, authRestaurateurMiddleware, deleteRestaurant);

router.get('/search', authMiddleware, searchRestaurant);

router.get('/search/dish', searchRestaurantsByDish);

router.post('/:id/menu', authMiddleware, authRestaurateurMiddleware, addOrUpdateMealInMenu);

router.delete('/:id/menu/:idMeal', authMiddleware, authRestaurateurMiddleware, deleteMealFromMenu);

export default router;