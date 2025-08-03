import Meal from "../models/Meal.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get all meals in DB
 * @route   GET /api/meals
 * @access  Public
 */
export const getMeals = asyncHandler(async (req, res) => {
    const meals = await Meal.find({});
    res.status(200).json(meals);
});

/**
 * @desc    Gett a meal by ID
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
    const { idMeal, strMeal, strCategory, strArea, price, isAvailable } = req.body;

    if (!idMeal || !strMeal) {
        res.status(400); 
        throw new Error("idMeal and strMeal fields are mandatory.");
    }

    try {
        const newMeal = await Meal.create({
            idMeal,
            strMeal,
            strCategory,
            strArea,
            price,
            isAvailable
        });
        res.status(201).json(newMeal);
    } catch (error) {
        if (error.code === 11000) {
            res.status(409);
            throw new Error(`A meal with idMeal '${idMeal}' already exists.`);
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
    const deletedMeal = await Meal.findByIdAndDelete(req.params.id);

    if (!deletedMeal) {
        res.status(404).json({ message: "Meal not found." });
        return;
    }

    res.status(200).json({ message: "Meal deleted successfully." });
});

/**
 * @desc    Update a meal
 * @route   PUT /api/meals/:id
 * @access  Private
 */
export const updateMeal = asyncHandler(async (req, res) => {
    const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, req.body, { 
        new: true, 
        runValidators: true 
    });

    if (!updatedMeal) {
        res.status(404).json({ message: "Meal not found." });
        return; 
    }
    res.status(200).json(updatedMeal);
});

/** 
 * @desc   Cerca i piatti in base a diversi criteri 
 * @route  GET /api/meals
 * @access Public
 */

export const searchMeal = asyncHandler(async (req, res) => {
    const { name, category } = req.query;
    let query = {}

    if(name){
        query.strMeal = {$regex: name, $options: 'i'}
    }
    if(category){
        query.strCategory = {$regex: category, $options: 'i'}
    }

    const meals = await Meal.find(query);

    if(meals.length === 0){
        return res.status(404).json({ message: 'No meal founded with this criteria.'});
    }

    res.status(200).json(meals);
});

