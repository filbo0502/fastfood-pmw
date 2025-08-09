import CONFIG from "../config.js";

const API_BASE_URL = CONFIG.API_BASE_URL;

const getRestaurant = async () => {
    try{
        const response = await fetch(`${API_BASE_URL}/api/restaurants/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(!response.ok){
            throw new Error('Error during server call.');
        }
        const restaurants = await response.json();
        console.log('Restaurants data: ', restaurants);
        showRestaurant(restaurants)
    }catch(error){
        console.error('Error fetching restaurants:', error);
        const container = document.getElementById('restaurant-container');
        container.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`
    }
}

const showRestaurant = (restaurants) => {
    const container = document.getElementById('restaurant-container');
    container.innerHTML = ""

    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = ''
        const cardBody = `<div class="card h-100">
                            <
        
        
        `;
    })
}