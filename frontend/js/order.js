import CONFIG from "./config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    const cartSummary = document.getElementById('cart-summary');
    const subtotalPrice = document.getElementById('subtotal-price');
    const finalPriceEl = document.getElementById('final-price');
    const deliveryCostDisplay = document.getElementById('delivery-cost-display');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const waitTimeDisplay = document.getElementById('wait-time-display');
    const waitTimeValue = document.getElementById('wait-time-value');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let restaurantId = localStorage.getItem('restaurantId');
    const token = localStorage.getItem('jwtToken');


    if (!token) {
        alert('You must be logged in to place an order.');
        window.location.href = 'login.html';
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty.');
        window.location.href = './searchRestaurant.html';
        return;
    }

    if (!restaurantId) {
        alert('Restaurant information is missing.');
        window.location.href = './searchRestaurant.html';
        return;
    }

    function renderCart() {
        if (cart.length === 0) {
            cartSummary.innerHTML = '<p class="text-muted text-center py-4">Your cart is empty.</p>';
            return;
        }

        let summaryHtml = '<div class="list-group">';
        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            summaryHtml += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1 fw-bold">${item.name}</h6>
                        <small class="text-muted">Quantity: ${item.quantity} × ${item.price.toFixed(2)}€</small>
                    </div>
                    <span class="badge bg-primary rounded-pill">${itemTotal}€</span>
                </div>
            `;
        });
        summaryHtml += '</div>';
        cartSummary.innerHTML = summaryHtml;
        updatePrices();
    }


    function updatePrices() {
        const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        subtotalPrice.textContent = `${cartTotal.toFixed(2)}€`;
        deliveryCostDisplay.textContent = '0.00€';
        finalPriceEl.textContent = `${cartTotal.toFixed(2)}€`;
    }


    async function handleConfirmOrder() {
        const items = cart.map(item => ({
            idMeal: item._id || item.idMeal, // Supporta entrambi i formati
            quantity: item.quantity
        }));

        const orderData = {
            restaurantId,
            items,
            deliveryType: 'pickup', // Per ora solo pickup
            deliveryAddress: null
        };


        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error creating order');
            }

            const data = await response.json();

            waitTimeValue.textContent = data.estimatedWaitTime;
            waitTimeDisplay.classList.remove('d-none');

            alert(`Order confirmed successfully!\n\nEstimated wait time: ${data.estimatedWaitTime} minutes\n\nYou can pick up your order at the restaurant.`);


            localStorage.removeItem('cart');
            localStorage.removeItem('restaurantId');
            window.location.href = './orderHistory.html';

        } catch (error) {
            console.error('Order error:', error);
            alert(`Error: ${error.message}`);
            confirmOrderBtn.disabled = false;
            confirmOrderBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Confirm Order';
        }
    }

    confirmOrderBtn.addEventListener('click', handleConfirmOrder);

    renderCart();
});