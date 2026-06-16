import Order from '../models/Order.js';

/**
 * @param {string} restaurantId - L'ID del ristorante.
 * @param {number} newOrderPrepTime - Il tempo di preparazione stimato per il nuovo ordine (in minuti).
 * @returns {Promise<number>} - Il tempo di attesa totale stimato (in minuti).
 */
export const calculateWaitTime = async (restaurantId, newOrderPrepTime) => {

    const pendingOrders = await Order.find({
        restaurant: restaurantId,
        status: { $in: ['ordered', 'preparing'] }
    });

    let maxRemainingTime = 0;
    const now = new Date();

    pendingOrders.forEach(order => {
        const elapsedMilliseconds = now.getTime() - new Date(order.createdAt).getTime();
        const elapsedMinutes = Math.floor(elapsedMilliseconds / (1000 * 60));
        const remainingTime = Math.max(0, order.estimatedPreparationTime - elapsedMinutes);

        if (remainingTime > maxRemainingTime) {
            maxRemainingTime = remainingTime;
        }
    });

    const totalWaitTime = maxRemainingTime + newOrderPrepTime;

    return Math.round(totalWaitTime);
};