import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';
import { calculateWaitTime } from '../utils/waitTime.js';

/**
 * @desc Get all orders
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
 * @desc Create new order
 * @route POST /api/orders
 * @access Private
 */

export const createOrder = asyncHandler(async (req, res) => {
    const { restaurantId, items, deliveryType, deliveryAddress } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if(!restaurant){
        return res.status(404).json({message: 'Restaurant not found.'});
    }

    let currentPrepTime = 0;
    let totalAmount = 0;
    const orderItems = [];

    for(const item of items){
        const menuItem = restaurant.menu.find(m => m.meal.toString() === item.idMeal);
        if(!menuItem || !menuItem.isAvailable){
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

export const getUserOrders = asyncHandler(async (req, res) => {
    const customerId = req.user.id;
    const orders = await Order.find({ customer: customerId })
        .populate('restaurant', 'name')
        .populate('items.meal', 'strMeal strMealThumb');

        res.status(200).json(orders);
});

/**
 * @desc   Update an order status
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

    if (userType === 'restaurateur' && (status === 'preparing' || status === 'delivering')) {
        if (order.restaurant.toString() !== userId) { 
            return res.status(403).json({ message: 'Unauthorized updating this order.' });
        }
        order.status = status;
    } 
        
    else if (userType === 'customer' && status === 'delivered') {
        if (order.customer.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized updating this order.' });
        }
        order.status = status;
    } 
    else {
        if (userType === 'restaurateur' && 
            status === 'delivered' && 
            order.deliveryType === 'pickup' && 
            order.restaurant.toString() === userId) {
            
            if (order.status === 'preparing') {
                order.status = status;
            } else {
                return res.status(400).json({ message: 'Pickup order can only be marked as delivered when it is in preparing status' });
            }
        } else {
            return res.status(400).json({ message: 'Unvalid or unauthorized updating status.' });
        }
    }
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
});

/**
 * @desc delete a single order
 * @route DELETE /api/orders/:id
 * @access Private
 */

export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndDelete(req.params.id);
    if(!order){
        return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted successfully.' });
});