import express from 'express';
import { authMiddleware, authRestaurateurMiddleware } from '../middlewares/authMiddleware.js';
import { getMeals, createMeal, deleteMeal, updateMeal, uploadMealImage } from '../controllers/mealController.js';

const router = express.Router();

router.get('/', authMiddleware, getMeals);

router.post('/', authMiddleware, authRestaurateurMiddleware, uploadMealImage.single('mealImage'), createMeal);

router.delete('/:id', authMiddleware, authRestaurateurMiddleware, deleteMeal);

router.post('/:id', authMiddleware, authRestaurateurMiddleware, uploadMealImage.single('mealImage'), updateMeal);

export default router
