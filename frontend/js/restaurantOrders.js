import { checkAuth, apiFetch, getUserID, showToast } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth('restaurateur')) {
        loadRestaurantOrders();
    }
});

window.loadRestaurantOrders = async () => {
    try {
        const userId = getUserID();
        if (!userId) throw new Error("User ID not found");

        const resResponse = await apiFetch(`/restaurants`);
        const restaurants = await resResponse.json();
        const myRestaurant = restaurants.find(r => r.owner === userId);

        if (!myRestaurant) {
            document.getElementById('orders-container').innerHTML = '<div class="alert alert-warning">You do not have a restaurant associated yet.</div>';
            return;
        }

        const restaurantId = myRestaurant._id;
        const response = await apiFetch(`/restaurants/${restaurantId}/orders`);

        if (!response.ok) throw new Error('Failed to fetch orders');

        const orders = await response.json();
        renderOrders(orders);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

const renderOrders = (orders) => {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No incoming orders.</div>';
        return;
    }

    orders.forEach(order => {
        container.appendChild(createOrderCard(order));
    });
}

const createOrderCard = (order) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const date = new Date(order.createdAt).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const itemsList = order.items.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${item.quantity}x ${item.meal?.strMeal || 'Deleted Item'}
            <span class="badge bg-primary rounded-pill">€${(item.price * item.quantity).toFixed(2)}</span>
        </li>
    `).join('');

    const statusOptions = ['ordered', 'preparing', 'delivering', 'delivered']
        .map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`)
        .join('');

    col.innerHTML = `
        <div class="card h-100 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center bg-light">
                <span class="fw-bold">Order #${order._id.slice(-6)}</span>
                <small class="text-muted">${date}</small>
            </div>
            <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">Customer: ${order.customer?.name || 'Unknown'}</h6>
                <div class="mb-3">
                   <ul class="list-group list-group-flush mb-3">
                        ${itemsList}
                   </ul>
                   <div class="d-flex justify-content-between fw-bold">
                        <span>Total:</span>
                        <span>€${order.totalAmount.toFixed(2)}</span>
                   </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label small text-muted">Delivery Type</label>
                    <div><span class="badge bg-secondary">${order.deliveryType}</span></div>
                     ${order.deliveryType === 'delivery' && order.deliveryAddress ? `<small class="text-muted d-block mt-1"><i class="fas fa-map-marker-alt me-1"></i>${order.deliveryAddress}</small>` : ''}
                </div>

                <div class="alert alert-light border p-2 mb-0">
                    <label class="form-label small fw-bold">Update Status:</label>
                    <div class="d-flex gap-2">
                        <select class="form-select status-select" data-id="${order._id}">
                            ${statusOptions}
                        </select>
                        <button class="btn btn-primary btn-sm update-status-btn" data-id="${order._id}">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const btn = col.querySelector('.update-status-btn');
    btn.addEventListener('click', () => {
        const select = col.querySelector(`.status-select`);
        updateStatus(order._id, select.value);
    });

    return col;
}

const updateStatus = async (orderId, newStatus) => {
    try {
        const response = await apiFetch(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error updating status');
        }

        showToast("Status updated successfully!", "success");

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, "error");
    }
}

const showError = (message) => {
    document.getElementById('orders-container').innerHTML =
        `<div class="col-12 text-center text-danger">Error: ${message}</div>`;
}
