import CONFIG from "./config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadOrders();
});

const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = './login.html';
    }
}

const loadOrders = async () => {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE_URL}/orders/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok){
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        renderOrders(orders);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
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

    const date = new Date(order.createdAt).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const restaurantName = order.restaurant?.name || 'Unknown Restaurant';
    const statusBadge = getStatusBadge(order.status);


    let actionButton = '';
    if (isActive && order.status === 'delivering') {
        actionButton = `
            <button class="btn btn-success w-100 mt-3 confirm-delivery-btn" data-id="${order._id}">
                <i class="fas fa-check-circle me-2"></i>Confirm Delivery
            </button>
        `;
    } else if (isActive && order.deliveryType === 'pickup' && order.status === 'preparing') {
        // Maybe restaurateur marks it as ready? The requirements say:
        // "Quando un ordine è pronto, il ristoratore segnala che esso è stato preparato... e passa direttamente nello stato di consegnato"
        // Wait, the requirement says: "Quando un ordine è ready... passa direttamente nello stato di consegnato" for pickup?
        // Quote: "Il ritiro dell’ordine deve essere fatto presso il ristorante... Quando un ordine è pronto, il ristoratore segnala che esso è stato preparato e viene rimosso dalla coda... e passa direttamente nello stato di consegnato."
        // So for Pickup, the RESTAURATEUR sets it to delivered (or ready then delivered). 
        // But the requirement also says: "L’ultimo scenario (Gestione delle consegne) prevede che l’utente finale quando riceve l’ordine lo segnala". This applies to Delivery type usually.
        // Let's assume Customer confirms delivery only for 'delivery' type or if it's explicitly 'delivering'.
    }

    const itemsList = order.items.map(item => `
        <div class="d-flex justify-content-between small mb-1">
            <span>${item.quantity}x ${item.meal?.strMeal || 'Deleted Item'}</span>
            <span>€${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    col.innerHTML = `
        <div class="card h-100 shadow-sm order-card status-${order.status}">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <span class="fw-bold"><i class="fas fa-store me-1"></i>${restaurantName}</span>
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
                    <small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${order.deliveryType}</small>
                </div>

                ${actionButton}
            </div>
        </div>
    `;

    const btn = col.querySelector('.confirm-delivery-btn');
    if (btn) {
        btn.addEventListener('click', () => confirmDelivery(order._id));
    }

    return col;
}

const getStatusBadge = (status) => {
    switch (status) {
        case 'ordered': return 'bg-warning text-dark';
        case 'preparing': return 'bg-info text-white';
        case 'delivering': return 'bg-primary';
        case 'delivered': return 'bg-success';
        default: return 'bg-secondary';
    }
}

const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

const confirmDelivery = async (orderId) => {
    if (!confirm('Have you received your order?')) return;

    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'delivered' })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error updating status');
        }

        Toastify({
            text: "Order confirmed as delivered!",
            backgroundColor: "#28a745",
            duration: 3000
        }).showToast();

        loadOrders();

    } catch (error) {
        console.error('Error:', error);
        Toastify({
            text: error.message,
            backgroundColor: "#dc3545",
            duration: 3000
        }).showToast();
    }
}

const showError = (message) => {
    document.getElementById('active-orders-container').innerHTML =
        `<div class="col-12 text-center text-danger">Error: ${message}</div>`;
}
