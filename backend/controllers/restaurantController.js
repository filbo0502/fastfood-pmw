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
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per ottenere tutti i ristoranti.' 
    */
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
});

/**
 * @desc Ottiene un ristorante
 * @route GET /api/restaurant
 * @access Public
 */
export const getRestaurant = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per ottenere un ristorante.' 
    */
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.status(200).json(restaurant);
});

/**
 * @desc Ottiene il ristorante del proprietario
 * @route GET /api/restaurant/my-restaurant
 * @access Private
 */
export const getMyRestaurant = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per ottenere il ristorante del proprietario.' 
    */
    const userId = req.user.id;
    const restaurant = await Restaurant.findOne({ owner: userId });

    if (!restaurant) {
        return res.status(404).json({ message: 'No restaurant found for this user.' });
    }

    res.status(200).json(restaurant);
});

/**
* @desc Ottiene il menu di un ristorante
* @route GET /api/restaurant/:id/menu
* @access Public
*/
export const getRestaurantMenu = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per ottenere il menu di un ristorante.' 
    */
    const restaurant = await Restaurant.findById(req.params.id).populate('menu.meal');
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
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per aggiornare i dati di un ristorante.' 
    */
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
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per eliminare un ristorante.' 
    */
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
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per cercare ristoranti.' 
    */
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
    res.status(200).json(restaurants);
});


/**
 * @desc   Aggiungi o aggiorna un piatto al menu di un ristorante
 * @route  POST /api/restaurant/:id/menu
 * @access Private (Owner only)
 */
export const addOrUpdateMealInMenu = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per aggiungere o aggiornare un piatto al menu di un ristorante.' 
    */
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
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per eliminare un piatto dal menu di un ristorante (se esiste).'
    */
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
 * @desc   Ottieni gli ordini per un ristorante specifico
 * @route  GET /api/restaurants/:id/orders
 * @access Private (Restaurateur only)
 */
export const getRestaurantOrders = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Restaurants']
        #swagger.description = 'Endpoint per ottenere gli ordini per un ristorante specifico.'
    */
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
