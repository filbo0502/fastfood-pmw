import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';
import { calculateWaitTime } from '../utils/waitTime.js';

/**
 * @desc Ottiene tutti gli ordini
 * @route GET /api/orders
 * @access Private
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate('customer', 'name')
        .populate('restaurant', 'name')
        .populate('items.meal', 'strMeal strMealThumb');
    res.status(200).json(orders);
});

/**
 * @desc Crea un nuovo ordine
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { restaurantId, items, deliveryType, deliveryAddress } = req.body;

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

    let totalWaitTime = currentPrepTime;

    if (deliveryType === 'pickup') {
        totalWaitTime = await calculateWaitTime(restaurantId, currentPrepTime);
    } else if (deliveryType === 'delivery') {
        totalWaitTime = currentPrepTime;
    }

    const newOrder = new Order({
        customer: req.user.id,
        restaurant: restaurantId,
        items: orderItems,
        totalAmount,
        status: 'ordered',
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
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
 * @route  GET /api/orders/:id
 * @access Private
 */
export const getUserOrders = asyncHandler(async (req, res) => {
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
    const { status } = req.body;
    const orderId = req.params.id;
    const userId = req.user.id;
    const userType = req.user.userType;

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const isRestaurateur = userType === 'restaurateur';
    const isOwner = order.restaurant.toString() === userId;
    const isCustomer = order.customer.toString() === userId;

    if (isRestaurateur && !isOwner) {
        return res.status(403).json({ message: 'Unauthorized: You do not own this order\'s restaurant.' });
    }
    if (!isRestaurateur && !isCustomer) {
        return res.status(403).json({ message: 'Unauthorized: You are not the customer of this order.' });
    }

    let isValidTransition = false;

    if (isRestaurateur) {
        if (['preparing', 'delivering'].includes(status)) {
            isValidTransition = true;
        } else if (status === 'delivered') {
            if (order.deliveryType === 'pickup' && order.status === 'preparing') {
                isValidTransition = true;
            } else {
                return res.status(400).json({ message: 'Pickup orders must be "preparing" before being marked "delivered" (ready).' });
            }
        }
    } else {
        if (status === 'delivered') {
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

/**
 * @desc Elimina un ordine
 * @route DELETE /api/orders/:id
 * @access Private
 */
export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted successfully.' });
});