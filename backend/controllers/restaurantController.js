import Restaurant from '../models/Restaurant.js';
import Meal from '../models/Meal.js';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

/**
 * @desc Ottiene tutti i ristoranti
 * @route GET /api/restaurant
 * @access Public
 */
export const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
});

/**
 * @desc Ottiene un ristorante
 * @route GET /api/restaurant
 * @access Public
 */

export const getRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json(restaurant);
});

/**
* @desc Ottiene il menu di un ristorante
* @route GET /api/restaurant/:id/menu
* @access Public
*/

export const getRestaurantMenu = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || !restaurant.menu) {
        return res.status(404).json({ message: 'Restaurant or menu not found.' });
    }
    res.status(200).json(restaurant.menu);
});


/**
 * @desc Aggiorna i dati di un ristorante
 * @route PUT /api/restaurant
 * @access Private
 */

export const updateRestaurant = asyncHandler(async (req, res) => {
    const udpdatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!udpdatedRestaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json({ message: 'Restaurant successfully updated.' });
});

/**
 * @desc  Elimina un ristorante
 * @route DELETE /api/restaurant/:id
 * @access Private
 */

export const deleteRestaurant = asyncHandler(async (req, res) => {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deletedRestaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json({ message: 'Restaurant successfully deleted.' });
});

/**
 * @desc Cerca ristoranti
 * @route GET /api/restaurant/search
 * @access Public
 */

export const searchRestaurant = asyncHandler(async (req, res) => {
    const { q } = req.query;

    let query = {};
    if (q) {
        const SearchTerm = String(q);
        // Cerca in nome, città e descrizione
        query = {
            $or: [
                { name: { $regex: SearchTerm, $options: 'i' } },
                { 'address.city': { $regex: SearchTerm, $options: 'i' } },
                { description: { $regex: SearchTerm, $options: 'i' } }
            ]
        }
    }

    const restaurants = await Restaurant.find(query);
    if (!restaurants.length) {
        return res.status(200).json([]);
    }
    res.status(200).json(restaurants);

});

/**
 * @desc   Aggiungi o aggiorna un piatto al menu di un ristorante
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
 * @desc   Elimina un piatto dal menu di un ristorante (se esiste)
 * @route  DELETE /api/restaurant/:id/menu/:idMeal
 * @access Private (Owner only)
 */
export const deleteMealFromMenu = asyncHandler(async (req, res) => {
    const restaurantId = req.params.id;
    const idMeal = req.params.idMeal;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurantId, {
        $pull: { menu: { meal: idMeal } }
    }, { new: true, runValidators: true });

    if (!updatedRestaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json({ message: 'Meal successfully deleted from the restaurant\'s menu.' });
});

/**
 * @desc   Cerca ristoranti per piatto
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
 * @desc   Ottieni gli ordini per un ristorante specifico
 * @route  GET /api/restaurants/:id/orders
 * @access Private (Restaurateur only)
 */
export const getRestaurantOrders = asyncHandler(async (req, res) => {
    const restaurantId = req.params.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view orders for this restaurant' });
    }

    const orders = await Order.find({ restaurant: restaurantId })
        .populate('customer', 'name email address')
        .populate('items.meal', 'strMeal')
        .sort({ createdAt: -1 });

    res.status(200).json(orders);
});
