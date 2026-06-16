import asyncHandler from 'express-async-handler';
import Restaurant from '../models/Restaurant.js';
import Meal from '../models/Meal.js';

/**
 * @desc Cerca piatti per nome, tipo e prezzo
 * @route GET /api/search/meals
 * @access Public
 */
export const searchMeals = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Search']
        #swagger.description = 'Endpoint per cercare piatti per nome, tipo e prezzo.' 
    */
    const { name, category, minPrice, maxPrice } = req.query;

    let matchConditions = {
        'menu.isAvailable': true
    };

    if (name) {
        matchConditions['mealDetails.strMeal'] = { $regex: name, $options: 'i' };
    }
    if (category) {
        matchConditions['mealDetails.strCategory'] = { $regex: category, $options: 'i' };
    }
    if (minPrice) {
        matchConditions['menu.price'] = { ...matchConditions['menu.price'], $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
        matchConditions['menu.price'] = { ...matchConditions['menu.price'], $lte: parseFloat(maxPrice) };
    }

    const mealsFromRestaurants = await Restaurant.aggregate([
        { $unwind: '$menu' },
        {
            $lookup: {
                from: 'meals',
                localField: 'menu.meal',
                foreignField: '_id',
                as: 'mealDetails'
            }
        },

        { $unwind: '$mealDetails' },

        { $match: matchConditions },

        { $limit: 20 },

        {
            $project: {
                _id: '$mealDetails._id',
                name: '$mealDetails.strMeal',
                category: '$mealDetails.strCategory',
                image: '$mealDetails.strMealThumb',
                price: '$menu.price',
                restaurant: {
                    _id: '$_id',
                    name: '$name',
                    address: '$address'
                }
            }
        }
    ]);

    res.json({ meals: mealsFromRestaurants });
});

/**
 * @desc Ottiene le categorie dei piatti
 * @route GET /api/search/categories
 * @access Public
 */
export const getMealCategories = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Search']
        #swagger.description = 'Endpoint per ottenere le categorie dei piatti.' 
    */
    const categories = await Meal.distinct('strCategory');
    res.json({ categories });
});

