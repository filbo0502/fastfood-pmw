import CONFIG from "../config.js";

const API_BASE_URL = CONFIG.API_BASE_URL;

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
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userID');
                document.getElementById('restaurant-info').innerHTML = `
                    <div class="alert alert-warning" role="alert">
                        <h4 class="alert-heading">Session Expired</h4>
                        <p>Your session has expired. Please log in again.</p>
                        <a href="./login.html" class="btn btn-primary">Go to Login</a>
                    </div>
                `;
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
                <a href="./login.html" class="btn btn-primary">Try Logging In</a>
            </div>
        `;
    }
};

const displayRestaurantInfo = (restaurant) => {
    const restaurantInfo = document.getElementById('restaurant-info');
    
    // Construct the correct image URL
    let imageUrl = '../images/hamburger.png'; // fallback
    if (restaurant.image) {
        // If the image path doesn't start with http, construct the full URL
        if (restaurant.image.startsWith('http')) {
            imageUrl = restaurant.image;
        } else if (restaurant.image.startsWith('/uploads/')) {
            // If the path already starts with /uploads/, just add the base URL
            imageUrl = `http://localhost:3001${restaurant.image}`;
        } else {
            // If it's just a filename, construct the full path
            imageUrl = `http://localhost:3001/uploads/restaurants/${restaurant.image}`;
        }
    }
    
    restaurantInfo.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <img src="${imageUrl}" 
                     class="img-fluid rounded" 
                     alt="${restaurant.name}">
            </div>
            <div class="col-md-8">
                <h1 class="mb-3">${restaurant.name}</h1>
                <p class="lead">${restaurant.description || 'No description available'}</p>
                <div class="d-flex gap-3 mb-3">
                    <span class="badge bg-primary">Restaurant</span>
                    <span class="badge bg-secondary">Food Delivery</span>
                </div>
                <div class="mb-3">
                    <p><strong>Phone:</strong> ${restaurant.phone || 'Not available'}</p>
                    <p><strong>Address:</strong> ${restaurant.address?.street || ''}, ${restaurant.address?.city || ''} ${restaurant.address?.zipCode || ''}</p>
                </div>
            </div>
        </div>
    `;
};

const loadRestaurantMenu = async (restaurantId) => {
    try {
        const token = localStorage.getItem('jwtToken');
        
        if (!token) {
            document.getElementById('menu-items').innerHTML = `
                <div class="alert alert-info" role="alert">
                    <p>Please log in to view the menu.</p>
                </div>
            `;
            return;
        }

        const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication required');
            }
            throw new Error('Error fetching menu');
        }

        const menuItems = await response.json();
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('menu-items').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
};

const displayMenuItems = (menuItems) => {
    const menuContainer = document.getElementById('menu-items');
    
    if (!menuItems || menuItems.length === 0) {
        menuContainer.innerHTML = '<p class="text-muted">No menu items available</p>';
        return;
    }

    const menuHTML = menuItems.map(menuItem => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <img src="${menuItem.meal?.strMealThumb || '../images/spaghetti.png'}" 
                     class="card-img-top" 
                     alt="${menuItem.meal?.strMeal || 'Meal'}"
                     style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${menuItem.meal?.strMeal || 'Meal Name'}</h5>
                    <p class="card-text flex-grow-1">${menuItem.meal?.strCategory || 'No category available'}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <span class="h5 text-primary mb-0">€${menuItem.price || '0.00'}</span>
                        <div class="d-flex flex-column gap-2">
                            <small class="text-muted">Prep time: ${menuItem.preparationTime || 0} min</small>
                            <button class="btn btn-primary btn-sm" 
                                    onclick="addToCart('${menuItem.meal?._id || ''}', '${menuItem.meal?.strMeal || ''}', ${menuItem.price || 0})"
                                    ${!menuItem.isAvailable ? 'disabled' : ''}>
                                ${menuItem.isAvailable ? 'Add to Cart' : 'Not Available'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    menuContainer.innerHTML = `
        <div class="row">
            ${menuHTML}
        </div>
    `;
};


window.addToCart = (mealId, mealName, price) => {
    console.log(`Adding ${mealName} to cart`);
    alert(`${mealName} added to cart!`);
};

document.addEventListener('DOMContentLoaded', loadRestaurantDetails);
