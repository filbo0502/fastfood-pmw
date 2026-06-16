import Meal from "../models/Meal.js";
import asyncHandler from "express-async-handler";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/meals';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'meal-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const uploadMealImage = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

/**
 * @desc    Ottieni tutti i piatti nel DB
 * @route   GET /api/meals
 * @access  Public
 */
export const getMeals = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Meals']
        #swagger.description = 'Endpoint per ottenere tutti i piatti nel DB.' 
    */
    const { custom, userId } = req.query;

    let query = {};

    // Filtra i piatti in base ai parametri
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
 * @desc    Crea un nuovo piatto
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
        // Genera un ID univoco se non fornito
        finalIdMeal = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (isCustom && (!price || price <= 0)) {
        res.status(400);
        throw new Error("Price is required for custom meals.");
    }

    let parsedIngredients = [];
    if (ingredients) {
        if (typeof ingredients === 'string') {
            parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(i => i);
        } else if (Array.isArray(ingredients)) {
            parsedIngredients = ingredients;
        }
    }

    let finalStrMealThumb = strMealThumb;
    if (req.file) {
        finalStrMealThumb = `/uploads/meals/${req.file.filename}`;
    }

    try {
        const mealData = {
            idMeal: finalIdMeal,
            strMeal,
            strCategory: strCategory || (isCustom ? 'Custom' : undefined),
            strArea,
            strMealThumb: finalStrMealThumb,
            ingredients: parsedIngredients,
            price: price || 0,
            isAvailable: isAvailable !== false && isAvailable !== 'false',
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
 * @desc    Elimina un piatto
 * @route   DELETE /api/meals/:id
 * @access  Private
 */
export const deleteMeal = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Meals']
        #swagger.description = 'Endpoint per eliminare un piatto.' 
    */
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        res.status(404).json({ message: "Meal not found." });
        return;
    }

    if (meal.isCustom && meal.createdBy && meal.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error("You can only delete your own custom meals.");
    }

    await meal.deleteOne();
    res.status(200).json({ message: "Meal deleted successfully." });
});

/**
 * @desc    Aggiorna un piatto
 * @route   POST /api/meals/:id (as per your routes)
 * @access  Private
 */
export const updateMeal = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Meals']
        #swagger.description = 'Endpoint per aggiornare un piatto.' 
    */
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        res.status(404).json({ message: "Meal not found." });
        return;
    }

    if (meal.isCustom && meal.createdBy && meal.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error("You can only update your own custom meals.");
    }

    let parsedIngredients = meal.ingredients;
    if (req.body.ingredients) {
        if (typeof req.body.ingredients === 'string') {
            parsedIngredients = req.body.ingredients.split(',').map(i => i.trim()).filter(i => i);
        } else if (Array.isArray(req.body.ingredients)) {
            parsedIngredients = req.body.ingredients;
        }
    }

    let finalStrMealThumb = meal.strMealThumb;
    if (req.file) {
        finalStrMealThumb = `/uploads/meals/${req.file.filename}`;
    }

    const updateData = {
        ...req.body,
        ingredients: parsedIngredients,
        strMealThumb: finalStrMealThumb
    };

    if (req.body.isAvailable !== undefined) {
        updateData.isAvailable = req.body.isAvailable !== false && req.body.isAvailable !== 'false';
    }

    const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    res.status(200).json(updatedMeal);
});
