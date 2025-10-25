import CONFIG from "../config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    // Variables
    let currentUser = null;
    let menuItems = [];
    let availableMeals = [];
    
    // DOM Elements
    const currentMenuContainer = document.getElementById('current-menu');
    const availableMealsContainer = document.getElementById('available-meals');
    const searchInput = document.getElementById('meal-search');
    const addCustomBtn = document.getElementById('add-custom-meal');
    const customMealForm = document.getElementById('custom-meal-form');

    // Bootstrap Modal instance
    let customMealModal = null;

    // Initialize
    init();

    function init() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = './login.html';
            return;
        }

        currentUser = getUserFromToken(token);
        if (!currentUser || currentUser.userType !== 'restaurant') {
            window.location.href = './login.html';
            return;
        }

        // Initialize Bootstrap modal
        const modalElement = document.getElementById('custom-meal-modal');
        if (modalElement) {
            customMealModal = new bootstrap.Modal(modalElement);
        }

        loadMeals();
        bindEvents();
    }

    function getUserFromToken(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
            console.error('Invalid token:', error);
            return null;
        }
    }

    async function loadMeals() {
        try {
            const availableResponse = await fetch(`${API_BASE_URL}/meals?custom=false`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            
            const customResponse = await fetch(`${API_BASE_URL}/meals?custom=true&userId=${currentUser.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            
            if (availableResponse.ok) {
                availableMeals = await availableResponse.json();
                renderMeals(availableMealsContainer, availableMeals, false);
            }
            
            if (customResponse.ok) {
                menuItems = await customResponse.json();
                renderMeals(currentMenuContainer, menuItems, true);
            } else {
                currentMenuContainer.innerHTML = '<div class="col-12"><p class="text-muted text-center">No custom meals created yet</p></div>';
            }
        } catch (error) {
            console.error('Error loading meals:', error);
            showError('Failed to load meals');
        }
    }

    function renderMeals(container, meals, isCustom) {
        container.innerHTML = '';
        
        if (meals.length === 0) {
            const emptyMessage = isCustom ? 
                'No custom meals created yet' : 
                'No meals available';
            container.innerHTML = `<div class="col-12"><p class="text-muted text-center">${emptyMessage}</p></div>`;
            return;
        }

        meals.forEach(meal => {
            // Create Bootstrap card structure
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-6 col-lg-4';
            
            const card = document.createElement('div');
            card.className = 'card h-100 shadow-sm meal-card';
            
            card.innerHTML = `
                <div class="position-relative">
                    <img src="${meal.strMealThumb || '../images/default-meal.jpg'}" 
                         class="card-img-top" alt="${meal.strMeal}" style="height: 200px; object-fit: cover;">
                    ${isCustom ? '<span class="badge bg-success position-absolute top-0 end-0 m-2">Custom</span>' : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${meal.strMeal}</h5>
                    <p class="card-text text-muted mb-2">
                        <i class="fas fa-tag me-1"></i>${meal.strCategory || 'Uncategorized'}
                    </p>
                    <p class="card-text fw-bold text-primary mb-3">
                        <i class="fas fa-euro-sign me-1"></i>€${(meal.price || 0).toFixed(2)}
                    </p>
                    ${isCustom ? `
                        <div class="mt-auto">
                            <div class="btn-group w-100" role="group">
                                <button class="btn btn-outline-primary btn-edit" data-item-id="${meal._id}">
                                    <i class="fas fa-edit me-1"></i>Edit
                                </button>
                                <button class="btn btn-outline-danger btn-remove" data-item-id="${meal._id}">
                                    <i class="fas fa-trash me-1"></i>Delete
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            colDiv.appendChild(card);
            container.appendChild(colDiv);
        });
    }

    function bindEvents() {
        // Custom meal actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-edit')) {
                editMeal(e.target.dataset.itemId);
            }
            if (e.target.classList.contains('btn-remove')) {
                deleteMeal(e.target.dataset.itemId);
            }
        });

        // Add custom meal
        if (addCustomBtn) {
            addCustomBtn.addEventListener('click', showCreateForm);
        }

        // Form submission
        if (customMealForm) {
            customMealForm.addEventListener('submit', handleFormSubmit);
        }

        // Search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    searchMeals(e.target.value.trim());
                } else {
                    loadMeals();
                }
            });
        }

        // Bootstrap modal events
        const modalElement = document.getElementById('custom-meal-modal');
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', function () {
                resetForm();
            });
        }
    }

    async function searchMeals(searchTerm) {
        try {
            const searchParams = `name=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(searchTerm)}`;
            
            // Search available meals
            const availableResponse = await fetch(`${API_BASE_URL}/meals/search?${searchParams}&custom=false`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            
            // Search custom meals
            const customResponse = await fetch(`${API_BASE_URL}/meals/search?${searchParams}&custom=true&userId=${currentUser.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            
            availableMeals = availableResponse.ok ? await availableResponse.json() : [];
            menuItems = customResponse.ok ? await customResponse.json() : [];
            
            renderMeals(availableMealsContainer, availableMeals, false);
            renderMeals(currentMenuContainer, menuItems, true);
            
        } catch (error) {
            console.error('Error searching meals:', error);
            showError('Error searching meals');
        }
    }

    function showCreateForm() {
        resetForm();
        // Update modal title and button text
        document.getElementById('customMealModalLabel').innerHTML = '<i class="fas fa-plus-circle me-2"></i>Create Custom Meal';
        document.querySelector('#custom-meal-form').nextElementSibling.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save me-1"></i>Create Meal';
        
        if (customMealModal) {
            customMealModal.show();
        }
    }

    function editMeal(mealId) {
        const meal = menuItems.find(m => m._id === mealId);
        if (!meal) return;

        // Populate form
        document.getElementById('meal-name').value = meal.strMeal;
        document.getElementById('meal-category').value = meal.strCategory || '';
        document.getElementById('meal-price').value = meal.price || '';
        document.getElementById('meal-available').checked = meal.isAvailable !== false;

        // Set edit mode
        customMealForm.dataset.editId = mealId;
        
        // Update modal title and button text
        document.getElementById('customMealModalLabel').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Custom Meal';
        document.querySelector('#custom-meal-form').nextElementSibling.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save me-1"></i>Update Meal';

        if (customMealModal) {
            customMealModal.show();
        }
    }

    async function deleteMeal(mealId) {
        // Use Bootstrap-styled confirmation
        if (!confirm('Are you sure you want to delete this meal? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });

            if (response.ok) {
                showSuccess('Meal deleted successfully');
                loadMeals();
            } else {
                showError('Failed to delete meal');
            }
        } catch (error) {
            console.error('Error deleting meal:', error);
            showError('Failed to delete meal');
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const editId = customMealForm.dataset.editId;
        
        const mealData = {
            strMeal: formData.get('meal-name'),
            strCategory: formData.get('meal-category') || 'Custom',
            price: parseFloat(formData.get('meal-price')) || 0,
            isAvailable: formData.get('meal-available') === 'on',
            isCustom: true
        };

        if (!mealData.strMeal || !mealData.price) {
            showError('Please fill in meal name and price');
            return;
        }

        try {
            const url = editId ? `${API_BASE_URL}/meals/${editId}` : `${API_BASE_URL}/meals`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(mealData)
            });

            if (response.ok) {
                showSuccess(editId ? 'Meal updated successfully' : 'Meal created successfully');
                hideModal();
                loadMeals();
            } else {
                const error = await response.json();
                showError(error.message || 'Failed to save meal');
            }
        } catch (error) {
            console.error('Error saving meal:', error);
            showError('Failed to save meal');
        }
    }

    function hideModal() {
        if (customMealModal) {
            customMealModal.hide();
        }
    }

    function resetForm() {
        customMealForm.reset();
        delete customMealForm.dataset.editId;
        // Reset modal title and button text to default
        document.getElementById('customMealModalLabel').innerHTML = '<i class="fas fa-plus-circle me-2"></i>Custom Meal';
        const submitBtn = document.querySelector('#custom-meal-form').nextElementSibling.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Create Meal';
        }
    }

    function showSuccess(message) {
        showNotification(message, 'success');
    }

    function showError(message) {
        showNotification(message, 'danger');
    }

    function showNotification(message, type) {
        // Remove existing notifications
        document.querySelectorAll('.toast').forEach(t => t.remove());

        // Create Bootstrap toast notification
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1060';
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);
        
        // Initialize and show Bootstrap toast
        const bootstrapToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 4000
        });
        bootstrapToast.show();
        
        // Clean up after toast is hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toastContainer.remove();
        });
    }
});
