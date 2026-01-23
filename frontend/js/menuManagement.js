import CONFIG from "./config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {

    const availableMealsContainer = document.getElementById('available-meals');
    const customMenuContainer = document.getElementById('current-menu');
    const searchInput = document.getElementById('meal-search');
    const addMealBtn = document.getElementById('add-custom-meal');

    const modal = document.getElementById('custom-meal-modal');
    const modalCloseBtn = modal.querySelector('.close');
    const form = document.getElementById('custom-meal-form');
    const modalTitle = modal.querySelector('h3');
    const submitBtn = form.querySelector('button[type="submit"]');

    let availableMealsData = [];
    let customMealsData = [];

    const token = localStorage.getItem('jwtToken');
    const userID = localStorage.getItem('userID');

    const loginRequiredAlert = `
        <div class="col-12 text-center">
            <div class="alert alert-info" role="alert">
                <h4 class="alert-heading">Login Required</h4>
                <p>Please log in to view and manage meals.</p>
                <a href="../pages/login.html" class="btn btn-primary">Go to Login</a>
            </div>
        </div>`;

    const sessionExpiredAlert = `
        <div class="col-12 text-center">
            <div class="alert alert-warning" role="alert">
                <h4 class="alert-heading">Session Expired</h4>
                <p>Your session has expired. Please log in again.</p>
                <a href="../pages/login.html" class="btn btn-primary">Go to Login</a>
            </div>
        </div>`;

    const genericErrorAlert = (message) => `
        <div class="col-12 text-center">
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error</h4>
                <p>${message}</p>
            </div>
        </div>`;

    const noAvailableMealsAlert = `
        <div class="col-12">
            <div class="alert alert-info" role="alert">
                <p class="mb-0">No meals found in the database matching your search.</p>
            </div>
        </div>`;

    const noCustomMealsAlert = `
        <div class="col-12">
            <div class="alert alert-info" role="alert">
                <p class="mb-0">You have not created any custom meals, or none match your search.</p>
            </div>
        </div>`;

    if (!token || !userID) {
        console.warn('User not authenticated.');
        availableMealsContainer.innerHTML = loginRequiredAlert;
        customMenuContainer.innerHTML = loginRequiredAlert;
    } else {
        fetchAvailableMeals();
        fetchCustomMeals();
    }

    async function fetchAvailableMeals(searchTerm = '') {
        if (!token) return;

        let url = searchTerm
            ? `${API_BASE_URL}/meals/search?name=${encodeURIComponent(searchTerm)}&custom=false`
            : `${API_BASE_URL}/meals?custom=false`;

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userID');
                    availableMealsContainer.innerHTML = sessionExpiredAlert;
                    return;
                }
                if (res.status === 404) {
                    availableMealsData = [];
                    renderAvailableMeals();
                    return;
                }
                throw new Error(`Error fetching available meals: ${res.statusText}`);
            }

            availableMealsData = await res.json();
            renderAvailableMeals(); // Update UI

        } catch (error) {
            console.error(error);
            availableMealsContainer.innerHTML = genericErrorAlert(error.message);
        }
    }

    async function fetchCustomMeals(searchTerm = '') {
        if (!token || !userID) return;

        let url = searchTerm
            ? `${API_BASE_URL}/meals/search?name=${encodeURIComponent(searchTerm)}&custom=true&userId=${userID}`
            : `${API_BASE_URL}/meals?custom=true&userId=${userID}`;

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userID');
                    customMenuContainer.innerHTML = sessionExpiredAlert;
                    return;
                }
                if (res.status === 404) {
                    customMealsData = [];
                    renderCustomMeals();
                    return;
                }
                throw new Error(`Error fetching custom meals: ${res.statusText}`);
            }

            customMealsData = await res.json();
            renderCustomMeals();

        } catch (error) {
            console.error(error);
            customMenuContainer.innerHTML = genericErrorAlert(error.message);
        }
    }

    function renderAvailableMeals() {
        availableMealsContainer.innerHTML = '';
        if (availableMealsData.length === 0) {
            availableMealsContainer.innerHTML = noAvailableMealsAlert;
            return;
        }
        availableMealsData.forEach(meal => {
            const card = renderMealCard(meal, false);
            availableMealsContainer.appendChild(card);
        });
    }

    function renderCustomMeals() {
        customMenuContainer.innerHTML = '';
        if (customMealsData.length === 0) {
            customMenuContainer.innerHTML = noCustomMealsAlert;
            return;
        }
        customMealsData.forEach(meal => {
            const card = renderMealCard(meal, true);
            customMenuContainer.appendChild(card);
        });
    }

    /**
     * Creates a meal card element based on the style of searchRestaurant.js
     * @param {object} meal - The meal data object
     * @param {boolean} isCustom - True if it's a custom meal (for styling)
     * @returns {HTMLElement} The card element
     */
    function renderMealCard(meal, isCustom) {
        const card = document.createElement('div');
        card.className = 'card meal-card-item h-100 shadow-sm';
        card.dataset.mealId = meal._id;

        const defaultImage = '../images/logo.png';
        const imageSrc = meal.strMealThumb || defaultImage;

        let customInfo = '';
        if (isCustom) {
            const price = parseFloat(meal.price).toFixed(2);
            const statusClass = meal.isAvailable ? 'text-success' : 'text-danger';
            const statusText = meal.isAvailable ? 'Available' : 'Unavailable';

            customInfo = `
                <p class="card-text mb-1"><strong>Price: €${price}</strong></p>
                <p class="card-text ${statusClass}">Status: ${statusText}</p>
            `;
        }

        const footerButtons = isCustom ? `
            <button class="btn btn-sm btn-secondary edit-btn me-2">Edit</button>
            <button class="btn btn-sm btn-danger delete-btn">Delete</button>
        ` : `
            <button class="btn btn-primary add-to-menu-btn">Add to My Menu</button>
        `;

        card.innerHTML = `
            <img src="${imageSrc}" 
                 class="card-img-top" 
                 alt="${meal.strMeal}" 
                 style="height: 180px; object-fit: cover;"
                 onerror="this.src='${defaultImage}'">
            
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${meal.strMeal}</h5>
                <p class="card-text text-muted mb-2">
                    <i class="fa-solid fa-tag me-2"></i>${meal.strCategory || 'No Category'}
                </p>
                ${customInfo}
                
                <div class="flex-grow-1"></div> 
            </div>

            <div class="card-footer text-center">
                ${footerButtons}
            </div>
        `;
        return card;
    }

    function openModal() { modal.style.display = 'block'; }
    function closeModal() {
        modal.style.display = 'none';
        form.reset();
        delete form.dataset.editingId;
        delete form.dataset.baseMealId;
    }

    function openModalForCreate() {
        form.reset();
        document.getElementById('meal-available').checked = true;
        modalTitle.textContent = 'Create Custom Meal';
        submitBtn.textContent = 'Create Meal';
        openModal();
    }

    function openModalForAdd(meal) {
        form.reset();
        document.getElementById('meal-name').value = meal.strMeal;
        document.getElementById('meal-category').value = meal.strCategory || '';
        document.getElementById('meal-price').value = '';
        document.getElementById('meal-available').checked = true;

        form.dataset.baseMealId = meal.idMeal;
        form.dataset.baseMealThumb = meal.strMealThumb || '';

        modalTitle.textContent = 'Add to My Menu';
        submitBtn.textContent = 'Add Meal';
        openModal();
    }

    function openModalForEdit(meal) {
        form.reset();
        form.dataset.editingId = meal._id;

        document.getElementById('meal-name').value = meal.strMeal;
        document.getElementById('meal-category').value = meal.strCategory || '';
        document.getElementById('meal-price').value = parseFloat(meal.price).toFixed(2);
        document.getElementById('meal-available').checked = meal.isAvailable;

        modalTitle.textContent = 'Edit Meal';
        submitBtn.textContent = 'Update Meal';
        openModal();
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        if (!token) return;
        const mealId = form.dataset.editingId;
        const isEditing = !!mealId;

        const mealData = {
            strMeal: document.getElementById('meal-name').value,
            strCategory: document.getElementById('meal-category').value,
            price: parseFloat(document.getElementById('meal-price').value),
            isAvailable: document.getElementById('meal-available').checked,
            isCustom: true
        };

        if (!isEditing && form.dataset.baseMealId) {
            mealData.idMeal = `${form.dataset.baseMealId}_custom_${Date.now()}`;
            mealData.strMealThumb = form.dataset.baseMealThumb;
        }

        if (!mealData.strMeal || !mealData.price || mealData.price <= 0) {
            showAlert('Please fill in the Meal Name and a valid Price.', 'warning');
            return;
        }

        const url = isEditing ? `${API_BASE_URL}/meals/${mealId}` : `${API_BASE_URL}/meals`;
        const method = 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(mealData)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error saving the meal.');
            }

            closeModal();
            showAlert(isEditing ? 'Meal updated!' : 'Meal created successfully!', 'success');
            fetchCustomMeals();

        } catch (error) {
            console.error(error);
            showAlert(error.message, 'danger');
        }
    }

    async function handleDeleteMeal(mealId) {
        if (!token) return;
        if (!confirm('Are you sure you want to delete this meal?')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error deleting the meal.');
            }

            showAlert('Meal deleted successfully.', 'success');
            fetchCustomMeals();

        } catch (error) {
            console.error(error);
            showAlert(error.message, 'danger');
        }
    }

    function handleSearch() {
        if (!token) return;
        const searchTerm = searchInput.value.trim();
        fetchAvailableMeals(searchTerm);
        fetchCustomMeals(searchTerm);
    }

    function showAlert(message, type = 'danger') {
        const container = document.querySelector('.main-content .container');
        if (!container) return;

        const existingAlert = container.querySelector('.alert.global-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3 global-alert`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        container.prepend(alertDiv);

        setTimeout(() => {
            const alertInstance = bootstrap.Alert.getOrCreateInstance(alertDiv);
            if (alertInstance) {
                alertInstance.close();
            } else if (alertDiv) {
                alertDiv.remove();
            }
        }, 5000);
    }



    addMealBtn.addEventListener('click', () => {
        if (token) openModalForCreate();
        else alert('Please log in to create meals.');
    });

    modalCloseBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    form.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);

    availableMealsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-menu-btn')) {
            const card = e.target.closest('.meal-card-item');
            const mealId = card.dataset.mealId;
            const meal = availableMealsData.find(m => m._id === mealId);
            if (meal) openModalForAdd(meal);
        }
    });


    customMenuContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.meal-card-item');
        if (!card) return;

        const mealId = card.dataset.mealId;

        if (e.target.classList.contains('edit-btn')) {
            const meal = customMealsData.find(m => m._id === mealId);
            if (meal) openModalForEdit(meal);
        }

        if (e.target.classList.contains('delete-btn')) {
            if (mealId) handleDeleteMeal(mealId);
        }
    });

});