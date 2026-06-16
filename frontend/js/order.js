import { showToast } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    const cartSummary = document.getElementById('cart-summary');
    const subtotalPrice = document.getElementById('subtotal-price');
    const finalPriceEl = document.getElementById('final-price');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const waitTimeDisplay = document.getElementById('wait-time-display');
    const waitTimeValue = document.getElementById('wait-time-value');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let restaurantId = localStorage.getItem('cartRestaurantId');
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        showToast('You must be logged in to place an order.', 'danger');
        window.location.href = './login.html';
        return;
    }

    if (cart.length === 0) {
        showToast('Your cart is empty.', 'warning');
        setTimeout(() => {
            window.location.href = './searchRestaurant.html';
        }, 2000);
        return;
    }

    if (!restaurantId) {
        showToast('Restaurant information is missing.', 'danger');
        window.location.href = './searchRestaurant.html';
        return;
    }

    const renderCart = () => {
        if (cart.length === 0) {
            cartSummary.innerHTML = '<p class="text-muted text-center py-4">Your cart is empty.</p>';
            setTimeout(() => {
                window.location.href = './searchRestaurant.html';
            }, 2000);
            return;
        }

        let summaryHtml = '<div class="list-group">';
        cart.forEach((item, index) => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            summaryHtml += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-outline-danger btn-sm me-3 remove-item-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <div>
                            <h6 class="mb-1 fw-bold">${item.name}</h6>
                            <small class="text-muted">Quantity: ${item.quantity} × ${item.price.toFixed(2)}€</small>
                        </div>
                    </div>
                    <span class="badge bg-primary rounded-pill">${itemTotal}€</span>
                </div>
            `;
        });
        summaryHtml += '</div>';
        cartSummary.innerHTML = summaryHtml;

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                removeFromCart(index);
            });
        });

        updatePrices();
    }

    const removeFromCart = (index) => {
        if (confirm('Are you sure you want to remove this item?')) {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));

            if (cart.length === 0) {
                localStorage.removeItem('cart');
                localStorage.removeItem('cartRestaurantId');
            }

            renderCart();
            updateCartNavigation();
        }
    }

    const updateCartNavigation = () => {
        const countSpan = document.getElementById('cart-count');
        if (countSpan) {
            const count = cart.reduce((acc, item) => acc + item.quantity, 0);
            countSpan.textContent = count;
        }
    }

    const updatePrices = () => {
        const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        subtotalPrice.textContent = `${cartTotal.toFixed(2)}€`;
        finalPriceEl.textContent = `${cartTotal.toFixed(2)}€`;
    }

    const handleConfirmOrder = async () => {
        const items = cart.map(item => ({
            idMeal: item._id || item.idMeal,
            quantity: item.quantity
        }));

        const orderData = {
            restaurantId,
            items
        };

        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';

        try {
            const response = await fetch(`/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error creating order');
            }

            waitTimeValue.textContent = data.estimatedWaitTime;
            waitTimeDisplay.classList.remove('d-none');

            showToast(`Order confirmed! Estimated wait time: ${data.estimatedWaitTime} minutes. Pick up at the restaurant.`, 'success');

            localStorage.removeItem('cart');
            localStorage.removeItem('cartRestaurantId');
            setTimeout(() => {
                window.location.href = './orderHistory.html';
            }, 3000);

        } catch (error) {
            console.error('Order error:', error);
            showToast(`Error: ${error.message}`, 'danger');
            confirmOrderBtn.disabled = false;
            confirmOrderBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Confirm Order';
        }
    }

    confirmOrderBtn.addEventListener('click', handleConfirmOrder);

    renderCart();
});