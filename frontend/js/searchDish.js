import { getImageUrl } from "./utils.js";
import { logout } from "./auth.js";

let dishNameInput;
let dishCategorySelect;
let dishMinPrice;
let dishMaxPrice;
let searchDishBtn;

const initializeSearch = async () => {
    dishNameInput = document.getElementById('dishNameInput');
    dishCategorySelect = document.getElementById('dishCategorySelect');
    dishMinPrice = document.getElementById('dishMinPrice');
    dishMaxPrice = document.getElementById('dishMaxPrice');
    searchDishBtn = document.getElementById('searchDishBtn');

    if (searchDishBtn) {
        searchDishBtn.addEventListener('click', performDishSearch);
    }

    // Carica le categorie
    try {
        const response = await fetch('/api/search/meals/categories');
        if (response.ok) {
            const data = await response.json();
            data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                dishCategorySelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
    
    // Caricamento iniziale
    performDishSearch();
}

const performDishSearch = async () => {
    const name = dishNameInput.value.trim();
    const category = dishCategorySelect.value;
    const minPrice = dishMinPrice.value;
    const maxPrice = dishMaxPrice.value;

    const container = document.getElementById('dish-container');
    const infoText = document.getElementById('searchDishResultsInfo');

    try {
        infoText.textContent = 'Searching...';

        const queryParams = new URLSearchParams();
        if (name) queryParams.append('name', name);
        if (category) queryParams.append('category', category);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);

        const response = await fetch(`/api/search/meals?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json();
        const meals = data.meals;

        if (meals.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">No dishes found matching your criteria.</div>
                </div>
            `;
            infoText.textContent = `No results found`;
            return;
        }

        infoText.textContent = `Found ${meals.length} dish(es)`;
        displayResults(meals);

    } catch (error) {
        console.error('Search error:', error);
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">Error performing search</div>
            </div>
        `;
    }
}

const displayResults = (meals) => {
    const container = document.getElementById('dish-container');
    container.innerHTML = '';

    meals.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';

        let imageUrl = '../images/spaghetti.png';
        if (item.image) {
            imageUrl = item.image.startsWith('http') ? item.image : `/${item.image.replace(/^\//, '')}`;
        }

        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${imageUrl}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="${item.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text text-muted mb-2">Category: ${item.category || 'Custom'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="h5 text-primary mb-0">€${item.price.toFixed(2)}</span>
                        </div>
                        <div class="bg-light p-2 rounded mb-3">
                            <small class="text-muted d-block mb-1">Available at:</small>
                            <strong>${item.restaurant.name}</strong>
                        </div>
                        <a href="./restaurantDetails.html?id=${item.restaurant._id}" class="btn btn-outline-primary w-100">
                            View Restaurant Menu
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', initializeSearch);
