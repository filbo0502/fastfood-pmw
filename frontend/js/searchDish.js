import CONFIG from "./config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

let dishSearchInput;
let searchTimeout;

const initializeSearch = () => {
    dishSearchInput = document.getElementById('dishSearchInput');
    if (dishSearchInput) {
        dishSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performDishSearch, 500);
        });
    }
}

const performDishSearch = async () => {
    const searchTerm = dishSearchInput.value.trim();
    const container = document.getElementById('dish-container');
    const infoText = document.getElementById('searchDishResultsInfo');

    if (searchTerm.length < 2) {
        container.innerHTML = '';
        infoText.textContent = 'Please enter at least 2 characters';
        return;
    }

    try {
        infoText.textContent = 'Searching...';

        const response = await fetch(`${API_BASE_URL}/restaurants/search/dish?dishName=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            if (response.status === 404) {
                container.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">No restaurants found serving "${searchTerm}"</div>
                    </div>
                `;
                infoText.textContent = `No results for "${searchTerm}"`;
                return;
            }
            throw new Error('Search failed');
        }

        const restaurants = await response.json();
        infoText.textContent = `Found ${restaurants.length} restaurant(s) serving "${searchTerm}"`;
        displayResults(restaurants);

    } catch (error) {
        console.error('Search error:', error);
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">Error performing search</div>
            </div>
        `;
    }
}

const displayResults = (restaurants) => {
    const container = document.getElementById('dish-container');
    container.innerHTML = '';

    restaurants.forEach(restaurant => {
        const searchTerm = dishSearchInput.value.toLowerCase();
        const matchingMeals = restaurant.menu.filter(item =>
            item.meal && item.meal.strMeal && item.meal.strMeal.toLowerCase().includes(searchTerm)
        );

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

        const matchingMealsHtml = matchingMeals.map(item =>
            `<span class="badge bg-success me-1">${item.meal.strMeal} (€${item.price})</span>`
        ).join('');

        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${imageUrl}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="${restaurant.name}">
                <div class="card-body">
                    <h5 class="card-title">${restaurant.name}</h5>
                    <div class="mb-2">
                        ${matchingMealsHtml}
                    </div>
                    <p class="card-text text-truncate">${restaurant.description || ''}</p>
                    <a href="./restaurantDetails.html?id=${restaurant._id}" class="btn btn-primary w-100">View Menu</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', initializeSearch);
