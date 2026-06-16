import { showToast } from "./utils.js";
import { logout } from "./auth.js";



const getRestaurantIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
};


const loadRestaurantDetails = async () => {
    const restaurantId = getRestaurantIdFromUrl();

    if (!restaurantId) {
        document.getElementById('restaurant-info').innerHTML = '<p class="text-danger">Restaurant ID not found</p>';
        return;
    }

    const token = localStorage.getItem('jwtToken');

    if (!token) {
        document.getElementById('restaurant-info').innerHTML = `
            <div class="alert alert-info" role="alert">
                <h4 class="alert-heading">Login Required</h4>
                <p>Please log in to view restaurant details.</p>
                <a href="./login.html" class="btn btn-primary">Go to Login</a>
            </div>
        `;
        document.getElementById('menu-section').classList.add('d-none');
        return;
    }

    try {
        const response = await fetch(`/api/restaurants/${restaurantId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                showToast('Your session has expired. Logging out...', 'warning');
                setTimeout(() => { logout(); }, 2000);
                return;
            }
            throw new Error('Error fetching restaurant details');
        }

        const restaurant = await response.json();
        displayRestaurantInfo(restaurant);
        loadRestaurantMenu(restaurantId);
    } catch (error) {
        console.error('Error loading restaurant details:', error);
        document.getElementById('restaurant-info').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
};

const displayRestaurantInfo = (restaurant) => {
    const restaurantInfo = document.getElementById('restaurant-info');

    let imageUrl = '../images/hamburger.png';
    if (restaurant.image) {
        if (restaurant.image.startsWith('http')) {
            imageUrl = restaurant.image;
        } else {
            // Rimuove lo slash iniziale se presente
            const imagePath = restaurant.image.startsWith('/') ? restaurant.image.substring(1) : restaurant.image;
            imageUrl = `/${imagePath}`;
        }
    }

    restaurantInfo.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <img src="${imageUrl}" 
                     class="img-fluid rounded shadow-sm" 
                     alt="${restaurant.name}"
                     onerror="this.src='../images/hamburger.png'"> </div>
            <div class="col-md-8">
                <h1 class="mb-3">${restaurant.name}</h1>
                <p class="lead">${restaurant.description || 'No description available'}</p>
                <div class="mb-3">
                    <p class="mb-1"><strong><i class="fas fa-phone me-2"></i>Phone:</strong> ${restaurant.phone || 'Not available'}</p>
                    <p class="mb-1"><strong><i class="fas fa-map-marker-alt me-2"></i>Address:</strong> ${restaurant.address?.street || ''}, ${restaurant.address?.city || ''} ${restaurant.address?.zipCode || ''}</p>
                </div>
            </div>
        </div>
    `;
};

/**
 * Carica il menu del ristorante specificato.
 * @param {string} restaurantId - L'ID del ristorante.
 */
const loadRestaurantMenu = async (restaurantId) => {
    const menuContainer = document.getElementById('menu-items');
    try {
        const token = localStorage.getItem('jwtToken');

        const response = await fetch(`/api/restaurants/${restaurantId}/menu`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error fetching menu');
        }

        const menuItems = await response.json();
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu:', error);
        menuContainer.innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
};

/**
 * Mostra gli articoli del menu sulla pagina.
 * @param {Array} menuItems - L'array di articoli del menu.
 */
const displayMenuItems = (menuItems) => {
    const menuContainer = document.getElementById('menu-items');

    if (!menuItems || menuItems.length === 0) {
        menuContainer.innerHTML = '<p class="text-muted">No menu items available for this restaurant.</p>';
        return;
    }

    const menuHTML = menuItems.map(menuItem => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 shadow-sm">
                <img src="${menuItem.meal?.strMealThumb || '../images/spaghetti.png'}" 
                     class="card-img-top" 
                     alt="${menuItem.meal?.strMeal || 'Meal'}"
                     style="height: 200px; object-fit: cover;"
                     onerror="this.src='../images/spaghetti.png'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${menuItem.meal?.strMeal || 'Meal Name'}</h5>
                    <p class="card-text text-muted">${menuItem.meal?.strCategory || 'No category'}</p>
                    <div class="mt-auto">
                        <p class="card-text mb-2"><small class="text-muted">Prep time: ${menuItem.preparationTime || '?'} min</small></p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 text-primary mb-0">€${(menuItem.price || 0).toFixed(2)}</span>
                            <button class="btn btn-primary btn-sm" 
                                    onclick="addToCart('${menuItem.meal?._id}', '${menuItem.meal?.strMeal}', ${menuItem.price})"
                                    ${!menuItem.isAvailable ? 'disabled' : ''}>
                                ${menuItem.isAvailable ? '<i class="fas fa-cart-plus me-1"></i> Add' : 'Not Available'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    menuContainer.innerHTML = `<div class="row">${menuHTML}</div>`;
};

const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);

    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'inline-block' : 'none';
    }
};

/**
 * Aggiunge un articolo al carrello nel localStorage.
 * Questa funzione è esposta globalmente (window.addToCart) per essere chiamata da onclick.
 * @param {string} mealId - L'ID del piatto da aggiungere.
 * @param {string} mealName - Il nome del piatto.
 * @param {number} price - Il prezzo del piatto.
 */
window.addToCart = (mealId, mealName, price) => {
    if (!mealId) {
        console.error('Cannot add to cart: mealId is missing');
        return;
    }

    const currentRestaurantId = getRestaurantIdFromUrl();
    const cartRestaurantId = localStorage.getItem('cartRestaurantId');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartRestaurantId && cartRestaurantId !== currentRestaurantId) {
        if (!confirm("You have items from another restaurant in your cart. Would you like to clear it and start a new order here?")) {
            return;
        }
        cart = [];
    }

    localStorage.setItem('cartRestaurantId', currentRestaurantId);

    // Cerca se il piatto è già nel carrello
    const existingItem = cart.find(item => item._id === mealId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            _id: mealId,
            name: mealName,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    showToast(`${mealName} added to cart!`, "info");

    updateCartCount();
};

document.addEventListener('DOMContentLoaded', () => {
    loadRestaurantDetails();
    updateCartCount();
});