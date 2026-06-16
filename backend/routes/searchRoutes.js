import express from 'express';
import { searchMeals, getMealCategories } from '../controllers/searchController.js';

const router = express.Router();

router.get('/meals', searchMeals);

router.get('/meals/categories', getMealCategories);

export default router;
