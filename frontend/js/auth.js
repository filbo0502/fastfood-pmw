import CONFIG from "./config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    const loginItem = document.querySelector('.login-btn');
    const logoutItem = document.querySelector('.logout-btn');
    const myProfileItem = document.querySelector('.my-profile-btn');
    const myRestaurantItem = document.querySelector('.my-restaurant-btn');
    const cartLink = document.querySelector('.cart-link');

    const token = localStorage.getItem('jwtToken');
    const userType = localStorage.getItem('userType');

    if (token) {
        if (loginItem) loginItem.classList.add('d-none');
        if (logoutItem) logoutItem.classList.remove('d-none');
        if (myProfileItem) myProfileItem.classList.remove('d-none');
        if (cartLink) cartLink.classList.remove('d-none');

        if (userType === 'restaurateur') {
            if (myRestaurantItem) myRestaurantItem.classList.remove('d-none');
        } else {
            if (myRestaurantItem) myRestaurantItem.classList.add('d-none');
        }
    } else {
        if (loginItem) loginItem.classList.remove('d-none');
        if (logoutItem) logoutItem.classList.add('d-none');
        if (myProfileItem) myProfileItem.classList.add('d-none');
        if (myRestaurantItem) myRestaurantItem.classList.add('d-none');
        if (cartLink) cartLink.classList.add('d-none');
    }

    if (logoutItem) {
        logoutItem.addEventListener('click', async (e) => { 
            e.preventDefault();
            try {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('Error calling server logout:', error);
            } finally {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userID');
                localStorage.removeItem('userType');
                localStorage.removeItem('restaurantId');
                window.location.href = '../pages/login.html'; 
            }
        });
    }
});