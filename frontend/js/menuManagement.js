import { checkAuth, apiFetch, getUserID, showToast } from "./utils.js";

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

    const isRestaurateur = checkAuth('restaurateur', false);

    if (!checkAuth(null, false)) {
        const loginRequiredAlert = `
        <div class="col-12 text-center">
            <div class="alert alert-info" role="alert">
                <h4 class="alert-heading">Login Required</h4>
                <p>Please log in to view and manage meals.</p>
                <a href="../pages/login.html" class="btn btn-primary">Go to Login</a>
            </div>
        </div>`;
        if (availableMealsContainer) availableMealsContainer.innerHTML = loginRequiredAlert;
        if (customMenuContainer) customMenuContainer.innerHTML = loginRequiredAlert;
        return;
    }

    const userID = getUserID();

    fetchAvailableMeals();
    fetchCustomMeals();

    async function fetchAvailableMeals(searchTerm = '') {
        try {
            const url = searchTerm
                ? `/meals/search?name=${encodeURIComponent(searchTerm)}&custom=false`
                : `/meals?custom=false`;

            const res = await apiFetch(url);
            if (!res.ok) {
                if (res.status === 404) {
                    availableMealsData = [];
                    renderAvailableMeals();
                    return;
                }
                throw new Error(`Error fetching available meals`);
            }

            availableMealsData = await res.json();
            renderAvailableMeals();

        } catch (error) {
            console.error(error);
            availableMealsContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    async function fetchCustomMeals(searchTerm = '') {
        try {
            const url = searchTerm
                ? `/meals/search?name=${encodeURIComponent(searchTerm)}&custom=true&userId=${userID}`
                : `/meals?custom=true&userId=${userID}`;

            const res = await apiFetch(url);
            if (!res.ok) {
                if (res.status === 404) {
                    customMealsData = [];
                    renderCustomMeals();
                    return;
                }
                throw new Error(`Error fetching custom meals`);
            }

            customMealsData = await res.json();
            renderCustomMeals();

        } catch (error) {
            console.error(error);
            customMenuContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    function renderAvailableMeals() {
        availableMealsContainer.innerHTML = '';
        if (availableMealsData.length === 0) {
            availableMealsContainer.innerHTML = `<div class="alert alert-info">No meals found.</div>`;
            return;
        }
        availableMealsData.forEach(meal => {
            availableMealsContainer.appendChild(renderMealCard(meal, false));
        });
    }

    function renderCustomMeals() {
        customMenuContainer.innerHTML = '';
        if (customMealsData.length === 0) {
            customMenuContainer.innerHTML = `<div class="alert alert-info">You have not created any custom meals.</div>`;
            return;
        }
        customMealsData.forEach(meal => {
            customMenuContainer.appendChild(renderMealCard(meal, true));
        });
    }

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

    // --- Event Handlers ---

    async function handleFormSubmit(e) {
        e.preventDefault();

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
            showToast('Please fill in the Meal Name and a valid Price.', 'warning');
            return;
        }

        const url = isEditing ? `/meals/${mealId}` : `/meals`;
        const method = 'POST';

        try {
            const res = await apiFetch(url, {
                method: method,
                body: JSON.stringify(mealData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error saving the meal.');
            }

            closeModal();
            showToast(isEditing ? 'Meal updated!' : 'Meal created successfully!', 'success');
            fetchCustomMeals();

        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    }

    async function handleDeleteMeal(mealId) {
        if (!confirm('Are you sure you want to delete this meal?')) return;

        try {
            const res = await apiFetch(`/meals/${mealId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error deleting the meal.');
            }

            showToast('Meal deleted successfully.', 'success');
            fetchCustomMeals();

        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    }

    function handleSearch() {
        const searchTerm = searchInput.value.trim();
        fetchAvailableMeals(searchTerm);
        fetchCustomMeals(searchTerm);
    }

    addMealBtn.addEventListener('click', () => {
        openModalForCreate();
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