import { showToast, formatStatus } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadOrders();
});

const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.warn('User not authenticated. Redirecting to login.');
        window.location.href = './login.html';
    }
}

const loadOrders = async () => {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/orders/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        renderOrders(orders);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('active-orders-container').innerHTML =
            `<div class="col-12 text-center text-danger">Error: ${error.message}</div>`;
    }
}

const renderOrders = (orders) => {
    const activeContainer = document.getElementById('active-orders-container');
    const pastContainer = document.getElementById('past-orders-container');

    activeContainer.innerHTML = '';
    pastContainer.innerHTML = '';

    if (orders.length === 0) {
        activeContainer.innerHTML = '<div class="col-12 text-center text-muted">No orders found.</div>';
        pastContainer.innerHTML = '<div class="col-12 text-center text-muted">No past orders.</div>';
        return;
    }

    // Ordina per data più recente
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const activeOrders = orders.filter(o => o.status !== 'delivered');
    const pastOrders = orders.filter(o => o.status === 'delivered');

    if (activeOrders.length === 0) {
        activeContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">No active orders</div>';
    } else {
        activeOrders.forEach(order => {
            activeContainer.appendChild(createOrderCard(order, true));
        });
    }

    if (pastOrders.length === 0) {
        pastContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">No past orders</div>';
    } else {
        pastOrders.forEach(order => {
            pastContainer.appendChild(createOrderCard(order, false));
        });
    }
}

const createOrderCard = (order, isActive) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-6';

    // Formatta la data in italiano
    const date = new Date(order.createdAt).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const restaurantName = order.restaurant?.name || 'Unknown Restaurant';
    const statusBadge = getStatusBadge(order.status);


    const itemsList = order.items.map(item => `
        <div class="d-flex justify-content-between small mb-1">
            <span>${item.quantity}x ${item.meal?.strMeal || 'Deleted Item'}</span>
            <span>€${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    col.innerHTML = `
        <div class="card h-100 shadow-sm order-card status-${order.status}">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <span class="fw-bold"><i class="fa-solid fa-store me-1"></i>${restaurantName}</span>
                <span class="small text-muted">${date}</span>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    ${itemsList}
                    <hr>
                    <div class="d-flex justify-content-between fw-bold">
                        <span>Total</span>
                        <span>€${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge ${statusBadge}">${formatStatus(order.status)}</span>
                    <small class="text-muted"><i class="fas fa-store me-1"></i>Pickup</small>
                </div>
            </div>
        </div>
    `;



    return col;
}

const getStatusBadge = (status) => {
    switch (status) {
        case 'ordered': return 'bg-warning text-dark';
        case 'preparing': return 'bg-info text-white';
        case 'ready': return 'bg-success';
        case 'delivered': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

