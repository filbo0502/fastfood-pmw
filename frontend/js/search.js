import { getImageUrl, showToast } from "./utils.js";
import { logout } from "./auth.js";

let filteredRestaurants = [];
let searchInput;

const getRestaurant = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        const container = document.getElementById('restaurant-container');
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    <h4 class="alert-heading">Login Required</h4>
                    <p>Please log in to view available restaurants.</p>
                    <a href="./login.html" class="btn btn-primary">Go to Login</a>
                </div>
            </div>
        `;
        return;
    }

    initializeSearch();
    // Initial load
    performSearch();
}

const debounce = (func, timeout = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const performSearch = async () => {
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const token = localStorage.getItem('jwtToken');
    
    if (!token) return;

    try {
        let url = `/api/restaurants`;
        if (searchTerm) {
            url = `/api/restaurants/search?q=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                showToast('Your session has expired. Logging out...', 'warning');
                setTimeout(() => { logout(); }, 2000);
                return;
            }
            throw new Error('Error during server call.');
        }

        filteredRestaurants = await response.json();
        
        updateSearchResultsInfo(searchTerm);
        showRestaurant(filteredRestaurants);

    } catch (error) {
        console.error('Error fetching restaurants:', error);
        const container = document.getElementById('restaurant-container');
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error</h4>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
    }
}

const updateSearchResultsInfo = (searchTerm) => {
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    if (searchResultsInfo) {
        if (searchTerm) {
            searchResultsInfo.textContent = `Found ${filteredRestaurants.length} restaurant(s) matching "${searchTerm}"`;
        } else {
            searchResultsInfo.textContent = `Showing all ${filteredRestaurants.length} restaurants`;
        }
    }
}

const showRestaurant = (restaurants) => {
    const container = document.getElementById('restaurant-container');
    container.innerHTML = "";

    if (restaurants.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    <h4 class="alert-heading">No Restaurants Found</h4>
                    <p>Try searching with different keywords or check your spelling.</p>
                    <button class="btn btn-primary" onclick="clearSearch()">Clear Search</button>
                </div>
            </div>
        `;
        return;
    }

    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';

        const imageUrl = getImageUrl(restaurant.image);

        const cuisineType = restaurant.cuisine || 'Various';

        const ratingDisplay = restaurant.rating ?
            `<div class="mb-2">
                <span class="text-warning">
                    ${'★'.repeat(Math.floor(restaurant.rating))}${'☆'.repeat(5 - Math.floor(restaurant.rating))}
                </span>
                <small class="text-muted ms-1">${restaurant.rating}/5</small>
             </div>` : '';

        let addressDisplay = '';
        if (restaurant.address?.street || restaurant.address?.city) {
            addressDisplay = `
                <p class="card-text text-muted">
                    <i class="fa-solid fa-map-marker-alt me-2"></i>
                    ${restaurant.address?.street || ''}
                    ${restaurant.address?.street && restaurant.address?.city ? ', ' : ''}
                    ${restaurant.address?.city || ''}
                </p>
            `;
        }

        card.innerHTML = `
            <div class="card custom-card h-100 shadow-sm">
                <img src="${imageUrl}" 
                     class="card-img-top" 
                     alt="Image of ${restaurant.name}" 
                     loading="lazy"
                     style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${restaurant.name}</h5>
                    ${ratingDisplay}
                    <p class="card-text text-muted mb-2">
                        <i class="fa-solid fa-utensils me-2"></i>${cuisineType}
                    </p>
                    <p class="card-text flex-grow-1">${restaurant.description || 'No description available'}</p>
                    ${addressDisplay}
                </div>
                <div class="card-footer text-center">
                    <small class="text-muted d-block mb-2">Click below to see the restaurant's menu</small>
                    <a href="./restaurantDetails.html?id=${restaurant._id}" 
                       class="btn btn-primary">View Menu</a>
                </div>
            </div>
        `;

        container.appendChild(card);
    })
}

const initializeSearch = () => {
    searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(performSearch, 300));
}

const clearSearch = () => {
    if (searchInput) {
        searchInput.value = '';
        performSearch();
    }
}

window.clearSearch = clearSearch;

document.addEventListener('DOMContentLoaded', getRestaurant);