import express from 'express';
import { authMiddleware, authRestaurateurMiddleware } from '../middlewares/authMiddleware.js';
import { getMeals, getMealById, createMeal, deleteMeal, updateMeal, searchMeal } from '../controllers/mealController.js';

const router = express.Router();

router.get('/',authMiddleware, getMeals);

router.get('/:id',authMiddleware, getMealById);

router.get('/search', authMiddleware, searchMeal);

router.post('/',authMiddleware, authRestaurateurMiddleware, createMeal);

router.delete('/:id',authMiddleware, authRestaurateurMiddleware, deleteMeal);

router.post('/:id',authMiddleware, authRestaurateurMiddleware, updateMeal);

export default router
