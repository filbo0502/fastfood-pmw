import { checkAuth, apiFetch, getUserID } from "./utils.js";

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth('restaurateur')) return;

    try {
        const userId = getUserID();

        // Fetch My Restaurant
        const resResponse = await apiFetch(`/restaurants`);
        if (!resResponse.ok) return;

        const restaurants = await resResponse.json();
        const myRestaurant = restaurants.find(r => r.owner === userId);

        if (myRestaurant) {
            await Promise.all([
                updateOrderStats(myRestaurant._id),
                updateMenuStats(userId),
                updateRevenueStats(myRestaurant._id)
            ]);
        }

    } catch (error) {
        console.error("Dashboard initialization error:", error);
    }
});

async function updateOrderStats(restaurantId) {
    try {
        const response = await apiFetch(`/restaurants/${restaurantId}/orders`);
        if (response.ok) {
            const orders = await response.json();
            const activeOrders = orders.filter(o => ['ordered', 'preparing'].includes(o.status)).length;

            if (activeOrders > 0) {
                const title = document.getElementById('orders-title');
                if (title) {
                    title.innerHTML += ` <span class="badge bg-danger rounded-pill ms-2" style="font-size: 0.7em">${activeOrders} New</span>`;
                }
            }
        }
    } catch (e) { console.error(e); }
}

async function updateMenuStats(userId) {
    try {
        const response = await apiFetch(`/meals?custom=true&userId=${userId}`);
        if (response.ok) {
            const meals = await response.json();
            if (meals.length > 0) {
                const title = document.getElementById('menu-title');
                if (title) {
                    title.innerHTML += ` <span class="badge bg-success rounded-pill ms-2" style="font-size: 0.7em">${meals.length} Items</span>`;
                }
            }
        }
    } catch (e) { console.error(e); }
}

async function updateRevenueStats(restaurantId) {
    try {
        const response = await apiFetch(`/statistics/restaurant/${restaurantId}`);
        if (response.ok) {
            const stats = await response.json();
            if (stats.totalRevenue > 0) {
                const title = document.getElementById('stats-title');
                if (title) {
                    title.innerHTML += ` <span class="badge bg-warning text-dark rounded-pill ms-2" style="font-size: 0.7em">€${stats.totalRevenue.toFixed(0)}</span>`;
                }
            }
        }
    } catch (e) { console.error(e); }
}
