import CONFIG from "../config.js";

const API_BASE_URL = CONFIG.API_BASE_URL;

let allRestaurants = [];
let filteredRestaurants = [];

let searchInput;

const getRestaurant = async () => {
    try{
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

        const response = await fetch(`${API_BASE_URL}/restaurants`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if(!response.ok){
            if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userID');
                const container = document.getElementById('restaurant-container');
                container.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-warning" role="alert">
                            <h4 class="alert-heading">Session Expired</h4>
                            <p>Your session has expired. Please log in again.</p>
                            <a href="./login.html" class="btn btn-primary">Go to Login</a>
                        </div>
                    </div>
                `;
                return;
            }
            throw new Error('Error during server call.');
        }
        
        allRestaurants = await response.json();
        console.log('Restaurants data: ', allRestaurants);
        
        initializeSearch();
    
        filteredRestaurants = [...allRestaurants];
        showRestaurant(filteredRestaurants);
        
    }catch(error){
        console.error('Error fetching restaurants:', error);
        const container = document.getElementById('restaurant-container');
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error</h4>
                    <p>${error.message}</p>
                    <a href="./login.html" class="btn btn-primary">Try Logging In</a>
                </div>
            </div>
        `;
    }
}

const initializeSearch = () => {
    searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(performSearch, 300));
}

const performSearch = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredRestaurants = [...allRestaurants];
    } else {
        // Filter restaurants based on name or location
        filteredRestaurants = allRestaurants.filter(restaurant => {
            const matchesName = restaurant.name && restaurant.name.toLowerCase().includes(searchTerm);
            const matchesDescription = restaurant.description && restaurant.description.toLowerCase().includes(searchTerm);
            const matchesCity = restaurant.addressCity && restaurant.addressCity.toLowerCase().includes(searchTerm);
            const matchesStreet = restaurant.addressStreet && restaurant.addressStreet.toLowerCase().includes(searchTerm);
            
            return matchesName || matchesDescription || matchesCity || matchesStreet;
        });
    }
    
    updateSearchResultsInfo(searchTerm);
    
    showRestaurant(filteredRestaurants);
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

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
        
        let imageUrl = '../images/hamburger.png';
        if (restaurant.image) {
            if (restaurant.image.startsWith('http')) {
                imageUrl = restaurant.image;
            } else if (restaurant.image.startsWith('/uploads/')) {
                imageUrl = `http://localhost:3001${restaurant.image}`;
            } else {
                imageUrl = `http://localhost:3001/uploads/restaurants/${restaurant.image}`;
            }
        }
        
        const cuisineType = restaurant.cuisine || 'Various';
        
        const ratingDisplay = restaurant.rating ? 
            `<div class="mb-2">
                <span class="text-warning">
                    ${'★'.repeat(Math.floor(restaurant.rating))}${'☆'.repeat(5 - Math.floor(restaurant.rating))}
                </span>
                <small class="text-muted ms-1">${restaurant.rating}/5</small>
             </div>` : '';
        
        let addressDisplay = '';
        if (restaurant.addressStreet || restaurant.addressCity) {
            addressDisplay = `
                <p class="card-text text-muted">
                    <i class="fa-solid fa-map-marker-alt me-2"></i>
                    ${restaurant.addressStreet ? restaurant.addressStreet : ''}
                    ${restaurant.addressStreet && restaurant.addressCity ? ', ' : ''}
                    ${restaurant.addressCity ? restaurant.addressCity : ''}
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

const clearSearch = () => {
    if (searchInput) {
        searchInput.value = '';
        performSearch();
    }
}

window.clearSearch = clearSearch;

document.addEventListener('DOMContentLoaded', getRestaurant);