import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import mongoose from 'mongoose';

/**
 * @desc Get restaurant statistics with chart data
 * @route GET /api/statistics/restaurant/:id
 * @access Private (Restaurant owner)
 */
export const getRestaurantStats = asyncHandler(async (req, res) => {
    const restaurantId = req.params.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        res.status(404);
        throw new Error('Ristorante non trovato');
    }

    if (restaurant.owner.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error('Non autorizzato');
    }

    // Last 7 days for simple chart
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Basic counts
    const totalOrders = await Order.countDocuments({
        restaurant: restaurantId,
        createdAt: { $gte: startDate }
    });

    const completedOrders = await Order.countDocuments({
        restaurant: restaurantId,
        status: 'delivered',
        createdAt: { $gte: startDate }
    });

    // Total revenue
    const revenueResult = await Order.aggregate([
        {
            $match: {
                restaurant: restaurantId,
                status: 'delivered',
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalAmount' }
            }
        }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const dailyOrders = await Order.aggregate([
        {
            $match: {
                restaurant: restaurantId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%d-%m-%Y", date: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Status distribution for pie chart
    const statusDistribution = await Order.aggregate([
        {
            $match: {
                restaurant: restaurantId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Top 3 meals (simple)
    // Correzione suggerita
    const topMeals = await Order.aggregate([
        {
            $match: {
                restaurant: new mongoose.Types.ObjectId(restaurantId), // È buona norma castare l'ID
                createdAt: { $gte: startDate }
            }
        },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'meals',
                localField: 'items.meal',
                foreignField: '_id',
                as: 'mealInfo'
            }
        },
        { $unwind: '$mealInfo' },
        {
            $group: {
                _id: '$mealInfo.strMeal',
                count: { $sum: '$items.quantity' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
        {
            $project: {
                _id: 0,
                mealName: '$_id',
                quantitySold: '$count'
            }
        }
    ]);

    res.json({
        restaurant: restaurant.name,
        totalOrders,
        completedOrders,
        totalRevenue,
        dailyOrders,
        statusDistribution,
        topMeals,
        period: 'Last 7 days'
    });
});


