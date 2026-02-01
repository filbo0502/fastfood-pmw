import asyncHandler from 'express-async-handler';
import Restaurant from '../models/Restaurant.js';
import Meal from '../models/Meal.js';

/**
 * @desc Cerca ristoranti per città e nome
 * @route GET /api/search/restaurants
 * @access Public
 */
export const searchRestaurants = asyncHandler(async (req, res) => {
    const { name, location } = req.query;

    let query = {};

    if (name) {
        query.name = { $regex: name, $options: 'i' };
    }

    if (location) {
        query.$or = [
            { 'address.street': { $regex: location, $options: 'i' } },
            { 'address.city': { $regex: location, $options: 'i' } },
            { 'address.zipCode': { $regex: location, $options: 'i' } }
        ];
    }

    const restaurants = await Restaurant.find(query)
        .select('name address phone image')
        .limit(20);

    res.json({ restaurants });
});

/**
 * @desc Cerca piatti per nome, tipo e prezzo
 * @route GET /api/search/meals
 * @access Public
 */
export const searchMeals = asyncHandler(async (req, res) => {
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
    const categories = await Meal.distinct('strCategory');
    res.json({ categories });
});

