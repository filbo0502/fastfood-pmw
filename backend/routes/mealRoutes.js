import express from 'express';
import { getMeals, getMealById, createMeal, deleteMeal, updateMeal } from '../controllers/mealController.js';

const router = express.Router();

router.get('/', getMeals);

router.get('/:id', getMealById);

router.post('/', createMeal);

router.delete('/:id', deleteMeal);

router.post('/:id', updateMeal);

export default router
