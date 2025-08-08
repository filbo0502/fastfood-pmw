import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';

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

    const pendingOrders = await Order.find({
        restaurant: restaurantId,
        status: { $in: ['ordered', 'prepared']}
    });

    let queueTime = 0
    const now = new Date();
      
    pendingOrders.forEach(order => {
        const elapsedMinutes = Math.floor((now - order.createdAt) / (1000 * 60));
        const remainingTime = Math.max(0, order.estimatedPreparationTime - elapsedMinutes);
        queueTime += remainingTime;
    });

    const totalWaitTime = queueTime + currentPrepTime;

    const newOrder = new Order({
        customer: req.user.id,
        restaurant: restaurantId,
        items: orderItems, 
        totalAmount,
        status: 'ordered',
        deliveryType,
        deliveryAddress: deliveryAddress,
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
        return res.status(400).json({ message: 'Unvalid or unauthorized updating status.' });
    }
        
    if(order.deliveryType === 'pickup' && status === 'preparing') {
        order.status = status;
    } 
    
    else if(order.deliveryType === 'pickup' && status === 'delivered') {
        if (order.status === 'preparing') {
            order.status = status;
        } else {
            return res.status(400).json({ message: 'Pickup order can only be marked as delivered when it is in preparing status' });
        }
    } 
    
    else if(order.deliveryType === 'pickup' && status === 'delivering') {
        return res.status(400).json({ message: 'Pickup orders cannot be marked as delivering. Use delivered status when customer picks up.' });
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