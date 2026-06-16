import { showToast, formatStatus } from "./utils.js";
import { requireRestaurateurAuth } from "./auth.js";

const token = localStorage.getItem('jwtToken');

document.addEventListener('DOMContentLoaded', () => {
    requireRestaurateurAuth();
    loadRestaurantOrders();
});

window.loadRestaurantOrders = async () => {
    try {
        const response = await fetch(`/api/restaurants/my-restaurant`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            document.getElementById('active-orders-container').innerHTML = '<div class="alert alert-warning">You do not have a restaurant associated yet.</div>';
            document.getElementById('delivered-orders-container').innerHTML = '';
            return;
        }

        const myRestaurant = await response.json();
        const restaurantId = myRestaurant._id;

        const response2 = await fetch(`/api/restaurants/${restaurantId}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response2.ok) throw new Error('Failed to fetch orders');

        const orders = await response2.json();
        renderOrders(orders);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

const renderOrders = (orders) => {
    const activeContainer = document.getElementById('active-orders-container');
    const deliveredContainer = document.getElementById('delivered-orders-container');

    activeContainer.innerHTML = '';
    deliveredContainer.innerHTML = '';

    if (orders.length === 0) {
        activeContainer.innerHTML = '<div class="col-12 text-center text-muted">No orders found.</div>';
        deliveredContainer.innerHTML = '<div class="col-12 text-center text-muted">No delivered orders.</div>';
        return;
    }

    const activeOrders = orders.filter(o => o.status !== 'delivered');
    const deliveredOrders = orders.filter(o => o.status === 'delivered');

    if (activeOrders.length === 0) {
        activeContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">No active orders</div>';
    } else {
        activeOrders.forEach(order => {
            activeContainer.appendChild(createOrderCard(order, true));
        });
    }

    if (deliveredOrders.length === 0) {
        deliveredContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">No delivered orders</div>';
    } else {
        deliveredOrders.forEach(order => {
            deliveredContainer.appendChild(createOrderCard(order, false));
        });
    }
}

const createOrderCard = (order, isActive = true) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    // Formattazione della data in italiano
    const date = new Date(order.createdAt).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const itemsList = order.items.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${item.quantity}x ${item.meal?.strMeal || 'Deleted Item'}
            <span class="badge bg-primary rounded-pill">€${(item.price * item.quantity).toFixed(2)}</span>
        </li>
    `).join('');

    let availableStatuses = [order.status];
    if (order.status === 'ordered') availableStatuses.push('preparing');
    if (order.status === 'preparing') availableStatuses.push('delivered');

    const statusOptions = availableStatuses
        .map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${formatStatus(status)}</option>`)
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

                ${isActive ? `
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
                ` : `
                <div class="alert alert-success border p-2 mb-0">
                    <i class="fas fa-check-circle me-2"></i><strong>Status:</strong> <span class="badge bg-success">Delivered</span>
                </div>
                `}
            </div>
        </div>
    `;

    if (isActive) {
        const btn = col.querySelector('.update-status-btn');
        btn.addEventListener('click', () => {
            const select = col.querySelector(`.status-select`);
            updateStatus(order._id, select.value);
        });
    }

    return col;
}



const updateStatus = async (orderId, newStatus) => {
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error updating status');
        }

        showToast("Status updated successfully!", "success");
        loadRestaurantOrders();

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, "danger");
    }
}

const showError = (message) => {
    const errorHtml = `<div class="col-12 text-center text-danger">Error: ${message}</div>`;
    document.getElementById('active-orders-container').innerHTML = errorHtml;
    document.getElementById('delivered-orders-container').innerHTML = errorHtml;
}
