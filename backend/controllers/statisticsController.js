import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import mongoose from 'mongoose';

/**
 * @desc Ottiene le statistiche di un ristorante con i dati per i grafici
 * @route GET /api/statistics/restaurant/:id
 * @access Private (Restaurant owner)
 */
export const getRestaurantStats = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Statistics']
        #swagger.description = 'Endpoint per ottenere le statistiche di un ristorante con i dati per i grafici.' 
    */
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

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const commonFilter = {
        restaurant: new mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: startDate }
    };

    const totalOrders = await Order.countDocuments(commonFilter);

    const completedOrders = await Order.countDocuments({
        ...commonFilter,
        status: 'delivered'
    });

    const stats = await Order.aggregate([
        { $match: commonFilter },
        {
            $facet: {
                totalRevenue: [
                    { $match: { status: 'delivered' } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ],
                dailyOrders: [
                    {
                        $group: {
                            _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ],
                statusDistribution: [
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ],
                topMeals: [
                    { $unwind: '$items' },
                    {
                        $group: {
                            _id: '$items.meal',
                            count: { $sum: '$items.quantity' }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 3 },
                    {
                        $lookup: {
                            from: 'meals',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'mealInfo'
                        }
                    },
                    { $unwind: '$mealInfo' },
                    {
                        $project: {
                            _id: 0,
                            mealName: '$mealInfo.strMeal',
                            quantitySold: '$count'
                        }
                    }
                ]
            }
        }
    ]);

    const result = stats[0];

    res.json({
        restaurant: restaurant.name,
        totalOrders,
        completedOrders,
        totalRevenue: result.totalRevenue[0] ? result.totalRevenue[0].total : 0,
        dailyOrders: result.dailyOrders,
        statusDistribution: result.statusDistribution,
        topMeals: result.topMeals,
        period: 'Last 7 days'
    });
});


