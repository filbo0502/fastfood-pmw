import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';
import { calculateWaitTime } from '../utils/waitTime.js';

/**
 * @desc Crea un nuovo ordine
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Orders']
        #swagger.description = 'Endpoint per creare un nuovo ordine.' 
    */
    const { restaurantId, items } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
    }

    let currentPrepTime = 0;
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
        const menuItem = restaurant.menu.find(m => m.meal.toString() === item.idMeal);
        if (!menuItem || !menuItem.isAvailable) {
            return res.status(400).json({ message: 'Meal not available.' });
        }

        currentPrepTime += menuItem.preparationTime * item.quantity;
        totalAmount += menuItem.price * item.quantity;

        orderItems.push({
            meal: item.idMeal,
            quantity: item.quantity,
            price: menuItem.price,
            preparationTime: menuItem.preparationTime
        });
    }

    const totalWaitTime = await calculateWaitTime(restaurantId, currentPrepTime);

    const newOrder = new Order({
        customer: req.user.id,
        restaurant: restaurantId,
        items: orderItems,
        totalAmount,
        status: 'ordered',
        estimatedPreparationTime: currentPrepTime,
    });

    const saveOrder = await newOrder.save();
    res.status(201).json({
        message: 'Order successfully done!',
        order: saveOrder,
        estimatedWaitTime: totalWaitTime,
    });
});

/**
 * @desc   Ottiene gli ordini di un utente
 * @route  GET /api/orders/user
 * @access Private
 */
export const getUserOrders = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Orders']
        #swagger.description = 'Endpoint per ottenere tutti gli ordini di un utente.' 
    */
    const customerId = req.user.id;
    const orders = await Order.find({ customer: customerId })
        .populate('restaurant', 'name')
        .populate('items.meal', 'strMeal strMealThumb');

    res.status(200).json(orders);
});

/**
 * @desc   Modifica lo stato di un ordine
 * @route  PUT /api/orders/:id/status
 * @access Private
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Orders']
        #swagger.description = 'Endpoint per modificare lo stato di un ordine.' 
    */
    const { status } = req.body;
    const orderId = req.params.id;
    const userId = req.user.id;
    const userType = req.user.userType;

    const order = await Order.findById(orderId).populate('restaurant');

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const isRestaurateur = userType === 'restaurateur';
    const isOwner = order.restaurant.owner.toString() === userId;
    const isCustomer = order.customer.toString() === userId;

    if (isRestaurateur && !isOwner) {
        return res.status(403).json({ message: 'Unauthorized: You do not own this order\'s restaurant.' });
    }
    if (!isRestaurateur && !isCustomer) {
        return res.status(403).json({ message: 'Unauthorized: You are not the customer of this order.' });
    }

    let isValidTransition = false;

    if (isRestaurateur) {
        if (status === 'preparing' && order.status === 'ordered') {
            isValidTransition = true;
        } else if (status === 'ready' && order.status === 'preparing') {
            isValidTransition = true;
        } else if (status === 'delivered' && order.status === 'preparing') {
            isValidTransition = true;
        }
    } else {
        if (status === 'delivered' && order.status === 'ready') {
            isValidTransition = true;
        }
    }

    if (!isValidTransition) {
        return res.status(400).json({ message: 'Invalid status transition or unauthorized action.' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
});
