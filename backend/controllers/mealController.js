import Meal from "../models/Meal.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get all meals in DB (including custom meals filtering)
 * @route   GET /api/meals
 * @access  Public
 */
export const getMeals = asyncHandler(async (req, res) => {
    const { custom, userId } = req.query;

    let query = {};

    if (custom === 'true' && userId) {
        query = {
            isCustom: true,
            createdBy: userId
        };
    } else if (custom === 'false') {
        query = {
            $or: [
                { isCustom: { $exists: false } },
                { isCustom: false }
            ]
        };
    }

    const meals = await Meal.find(query);
    res.status(200).json(meals);
});

/**
 * @desc    Get a meal by ID
 * @route   GET /api/meals/:id
 * @access  Public
 */
export const getMealById = asyncHandler(async (req, res) => {
    const meal = await Meal.findById(req.params.id);

    if (meal) {
        res.status(200).json(meal);
    } else {
        res.status(404);
        throw new Error("Meal not found.");
    }
});

/**
 * @desc    Create a new meal
 * @route   POST /api/meals
 * @access  Private
 */
export const createMeal = asyncHandler(async (req, res) => {
    const {
        idMeal,
        strMeal,
        strCategory,
        strArea,
        strMealThumb,
        ingredients,
        allergies,
        price,
        isAvailable,
        preparationTime,
        isCustom
    } = req.body;

    if (!strMeal) {
        res.status(400);
        throw new Error("strMeal field is mandatory.");
    }

    let finalIdMeal = idMeal;
    if (!finalIdMeal) {
        finalIdMeal = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (isCustom && (!price || price <= 0)) {
        res.status(400);
        throw new Error("Price is required for custom meals.");
    }

    try {
        const mealData = {
            idMeal: finalIdMeal,
            strMeal,
            strCategory: strCategory || (isCustom ? 'Custom' : undefined),
            strArea,
            strMealThumb,
            ingredients: ingredients || [],
            allergies: allergies || [],
            price: price || 0,
            isAvailable: isAvailable !== false,
            preparationTime
        };


        if (isCustom) {
            mealData.isCustom = true;
            mealData.createdBy = req.user.id;
        }

        const newMeal = await Meal.create(mealData);

        const response = isCustom ? {
            message: 'Custom meal created successfully',
            meal: newMeal
        } : newMeal;

        res.status(201).json(response);
    } catch (error) {
        if (error.code === 11000) {
            res.status(409);
            throw new Error(`A meal with idMeal '${finalIdMeal}' already exists.`);
        }
        res.status(400);
        throw new Error(error.message);
    }
});

/**
 * @desc    Delete a meal
 * @route   DELETE /api/meals/:id
 * @access  Private
 */
export const deleteMeal = asyncHandler(async (req, res) => {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        res.status(404).json({ message: "Meal not found." });
        return;
    }

    if (meal.isCustom && meal.createdBy && meal.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error("You can only delete your own custom meals.");
    }

    const deletedMeal = await Meal.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Meal deleted successfully." }, deletedMeal);
});

/**
 * @desc    Update a meal
 * @route   POST /api/meals/:id (as per your routes)
 * @access  Private
 */
export const updateMeal = asyncHandler(async (req, res) => {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        res.status(404).json({ message: "Meal not found." });
        return;
    }

    if (meal.isCustom && meal.createdBy && meal.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error("You can only update your own custom meals.");
    }

    const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json(updatedMeal);
});

/**
 * @desc   Search meals by name and category
 * @route  GET /api/meals/search
 * @access Public
 */
export const searchMeal = asyncHandler(async (req, res) => {
    const { name, category, userId, custom } = req.query;
    let query = {};

    if (name) {
        query.strMeal = { $regex: name, $options: 'i' };
    }
    if (category) {
        query.strCategory = { $regex: category, $options: 'i' };
    }

    const { minPrice, maxPrice } = req.query;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (custom === 'true' && userId) {
        query.isCustom = true;
        query.createdBy = userId;
    } else if (custom === 'false') {
        query.$or = [
            { isCustom: { $exists: false } },
            { isCustom: false }
        ];
    }

    const meals = await Meal.find(query);

    if (meals.length === 0) {
        return res.status(404).json({ message: 'No meals found with this criteria.' });
    }

    res.status(200).json(meals);
});
