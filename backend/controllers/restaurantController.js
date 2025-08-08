import Restaurant from '../models/Restaurant.js';
import Meal from '../models/Meal.js';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

/**
 * @desc Get all restaurants
 * @route GET /api/restaurant
 * @access Public
 */
export const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
});

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
* @desc Get restaurant menu
 * @route GET /api/restaurant/:id/menu
 * @access Public
 */

export const getRestaurantMenu = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if(!restaurant || !restaurant.menu){
        return res.status(404).json({ message: 'Restaurant or menu not found.' });
    }
    res.status(200).json(restaurant.menu);
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
 * @route DELETE /api/restaurant/:id
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
 * @route GET /api/restaurant/search
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
    const { idMeal, price, preparationTime, isAvailable } = req.body;
    const restaurantId = req.params.id;
    
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
  }
  
    const mealExists = await Meal.findById(idMeal);
    if (!mealExists) {
        return res.status(404).json({ message: 'Meal not found in the global list.' });
    }
  
    const menuItem = {
        meal: idMeal,
        price,
        preparationTime,
        isAvailable
    };

    const existingItemIndex = restaurant.menu.findIndex(item => item.meal.toString() === idMeal);

    if (existingItemIndex > -1) {
        restaurant.menu[existingItemIndex] = menuItem;
    } else {
        restaurant.menu.push(menuItem);
    }
    await restaurant.save();
    res.status(200).json(restaurant.menu);
});

/**
 * @desc   Delete a meal from the restaurant's menu (if it exists)
 * @route  DELETE /api/restaurant/:id/menu/:idMeal
 * @access Private (Owner only)
 */
export const deleteMealFromMenu = asyncHandler(async (req, res) => {
    const restaurantId = req.params.id;
    const idMeal = req.params.idMeal;
    
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurantId, {
        $pull: { menu: { meal: idMeal } }
    }, { new: true, runValidators: true });

    if(!updatedRestaurant){
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json({ message: 'Meal successfully deleted from the restaurant\'s menu.' });
});

/**
 * @desc   Search restaurants by dish
 * @route  GET /api/restaurant/search/dish
 * @access Public
 */
export const searchRestaurantsByDish = asyncHandler(async (req, res) => {
    const { dishName } = req.query;
    
    if (!dishName) {
        return res.status(400).json({ message: 'Dish name parameter is required.' });
    }

    const meals = await Meal.find({
        strMeal: { $regex: dishName, $options: 'i' }
    });

    if (meals.length === 0) {
        return res.status(404).json({ message: 'No dishes found with this name.' });
    }

    const mealIds = meals.map(meal => meal._id);

    const restaurants = await Restaurant.find({
        'menu.meal': { $in: mealIds }
    }).populate('menu.meal', 'strMeal strMealThumb');

    if (restaurants.length === 0) {
        return res.status(404).json({ message: 'No restaurants found serving this dish.' });
    }

    res.status(200).json(restaurants);
});

/**
 * @desc   Get restaurant statistics
 * @route  GET /api/restaurant/:id/statistics
 * @access Private (Restaurant Owner only)
 */
export const getRestaurantStatistics = asyncHandler(async (req, res) => {
    const restaurantId = req.params.id;
    

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    
    if (restaurant.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this restaurant\'s statistics.' });
    }

    const orders = await Order.find({ restaurant: restaurantId });
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const ordersByStatus = {
        ordered: orders.filter(order => order.status === 'ordered').length,
        preparing: orders.filter(order => order.status === 'preparing').length,
        delivering: orders.filter(order => order.status === 'delivering').length,
        delivered: orders.filter(order => order.status === 'delivered').length
    };

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const popularMeals = await Order.aggregate([
        { $match: { restaurant: restaurant._id } },
        { $unwind: '$items' },
        { $group: { _id: '$items.meal', count: { $sum: '$items.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'meals', localField: '_id', foreignField: '_id', as: 'meal' } }
    ]);

    const statistics = {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        popularMeals: popularMeals.map(item => ({
            meal: item.meal[0],
            orderCount: item.count
        }))
    };

    res.status(200).json(statistics);
});