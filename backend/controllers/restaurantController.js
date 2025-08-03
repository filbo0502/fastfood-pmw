import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc Get restaurant 
 * @route GET /api/restaurant
 * @access Public
 */

export const getRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if(!restaurant){
       return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json(restaurant);
});

/**
 * @desc Update restaurant data
 * @route PUT /api/restaurant
 * @access Private
 */

export const updateRestaurant = asyncHandler(async (req, res) => {
    const udpdatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!udpdatedRestaurant){
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json({ message: 'Restaurant successfully updated.' });
});

/**
 * @desc Delete restaurant data
 * @route DELETE /api/restaurant
 * @access Private
 */

export const deleteRestaurant = asyncHandler(async (req, res) => {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if(!deletedRestaurant){
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json({ message: 'Restaurant successfully deleted.' });
});

/**
 * @desc Search for restaurants
 * @route GET /api/restaurants/search
 * @access Public
 */

export const searchRestaurant = asyncHandler(async (req, res) => {
    const { q } = req.query;

    let query = {};
    if(q){
        const SearchTerm = String(q);
        query = {
            $or: [
                { name: { $regex: SearchTerm, $options: 'i' } },
                { 'address.city': { $regex: SearchTerm, $options: 'i' } },
                { description: { $regex: SearchTerm, $options: 'i' } }
            ]
        }
    }

    const restaurants = await Restaurant.find(query);
    if(!restaurants.length){
        return res.status(200).json([]);
    }
    res.status(200).json(restaurants);

});

/**
 * @desc   Add or update a meal in the restaurant's menu
 * @route  POST /api/restaurant/:id/menu
 * @access Private (Owner only)
 */
export const addOrUpdateMealInMenu = asyncHandler(async (req, res) => {
    const { mealId, price, preparationTime, isAvailable } = req.body;
    const restaurantId = req.params.id;
    
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
  }
  
    const mealExists = await Meal.findById(mealId);
    if (!mealExists) {
        return res.status(404).json({ message: 'Meal not found in the global list.' });
    }
  
    const menuItem = {
        meal: mealId,
        price,
        preparationTime,
        isAvailable
    };

    const existingMenuItemIndex = restaurant.menu.findIndex(item => item.meal.toString() === mealId);

    if (existingMenuItemIndex > -1) {
        restaurant.menu[existingMenuItemIndex] = menuItem;
    } else {
        restaurant.menu.push(menuItem);
    }
    await restaurant.save();
    res.status(200).json(restaurant.menu);
});