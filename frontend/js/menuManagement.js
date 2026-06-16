import { getImageUrl, showToast } from "./utils.js";

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
    let restaurantId = null;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            restaurantId = payload.restaurantId;
        } catch (error) {
            console.error('Error decoding JWT:', error);
        }
    }

    const renderMealCard = (meal, isCustom) => {
        const card = document.createElement('div');
        card.className = 'card meal-card-item h-100 shadow-sm';
        card.dataset.mealId = meal._id;

        const defaultImage = '../images/logo.png';
        const imageSrc = meal.strMealThumb || defaultImage;

        // Info aggiuntive solo per i piatti custom
        let customInfo = '';
        if (isCustom && meal.price != null) {
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

    const renderAvailableMeals = () => {
        availableMealsContainer.innerHTML = '';
        if (availableMealsData.length === 0) {
            availableMealsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        <p class="mb-0">No meals found in the database matching your search.</p>
                    </div>
                </div>`;
            return;
        }
        availableMealsData.forEach(meal => {
            const card = renderMealCard(meal, false);
            availableMealsContainer.appendChild(card);
        });
    }

    const renderCustomMeals = () => {
        customMenuContainer.innerHTML = '';
        if (customMealsData.length === 0) {
            customMenuContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        <p class="mb-0">You have not created any custom meals, or none match your search.</p>
                    </div>
                </div>`;
            return;
        }
        customMealsData.forEach(meal => {
            const card = renderMealCard(meal, true);
            customMenuContainer.appendChild(card);
        });
    }

    const fetchMeals = async (isCustom, searchTerm = '') => {
        if (!token) return;
        if (isCustom && !userID) return;

        const container = isCustom ? customMenuContainer : availableMealsContainer;
        const renderFunction = isCustom ? renderCustomMeals : renderAvailableMeals;
        const mealType = isCustom ? 'custom' : 'available';

        try {
            const url = isCustom
                ? `/api/meals?custom=true&userId=${userID}`
                : `/api/meals?custom=false`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 404) {
                    if (isCustom) {
                        customMealsData = [];
                    } else {
                        availableMealsData = [];
                    }
                    renderFunction();
                    return;
                }
                throw new Error(`Error fetching ${mealType} meals: ${res.statusText}`);
            }

            const allMeals = await res.json();

            // Filtra per search term se presente
            const filteredMeals = searchTerm
                ? allMeals.filter(meal => meal.strMeal.toLowerCase().includes(searchTerm.toLowerCase()))
                : allMeals;

            // Aggiorna lo stato appropriato
            if (isCustom) {
                customMealsData = filteredMeals;
            } else {
                availableMealsData = filteredMeals;
            }

            renderFunction();

        } catch (error) {
            console.error(error);
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Error</h4>
                        <p>${error.message}</p>
                    </div>
                </div>`;
        }
    }

    if (!token || !userID) {
        console.warn('User not authenticated.');
        // Mostra un alert per chiedere il login
        const loginAlert = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    <h4 class="alert-heading">Login Required</h4>
                    <p>Please log in to view and manage meals.</p>
                    <a href="../pages/login.html" class="btn btn-primary">Go to Login</a>
                </div>
            </div>`;
        availableMealsContainer.innerHTML = loginAlert;
        customMenuContainer.innerHTML = loginAlert;
    } else {
        fetchMeals(false); // piatti disponibili nel DB
        fetchMeals(true); // piatti personalizzati
    }

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
        delete form.dataset.editingId;
        delete form.dataset.baseMealId;
    }

    const openModalForCreate = () => {
        form.reset();
        document.getElementById('meal-available').checked = true;
        document.getElementById('meal-ingredients').value = '';
        document.getElementById('meal-image').value = '';
        document.getElementById('meal-image').required = true;
        modalTitle.textContent = 'Create Custom Meal';
        submitBtn.textContent = 'Create Meal';
        modal.style.display = 'block';
    }

    const openModalForAdd = (meal) => {
        form.reset();
        document.getElementById('meal-name').value = meal.strMeal;
        document.getElementById('meal-category').value = meal.strCategory || '';
        document.getElementById('meal-price').value = '';
        document.getElementById('meal-available').checked = true;
        document.getElementById('meal-ingredients').value = meal.ingredients ? meal.ingredients.join(', ') : '';
        document.getElementById('meal-image').value = '';
        document.getElementById('meal-image').required = false;

        form.dataset.baseMealId = meal.idMeal;
        form.dataset.baseMealThumb = meal.strMealThumb || '';

        modalTitle.textContent = 'Add to My Menu';
        submitBtn.textContent = 'Add Meal';
        modal.style.display = 'block';
    }

    const openModalForEdit = (meal) => {
        form.reset();
        form.dataset.editingId = meal._id;

        document.getElementById('meal-name').value = meal.strMeal;
        document.getElementById('meal-category').value = meal.strCategory || '';
        document.getElementById('meal-price').value = parseFloat(meal.price).toFixed(2);
        document.getElementById('meal-available').checked = meal.isAvailable;
        document.getElementById('meal-ingredients').value = meal.ingredients ? meal.ingredients.join(', ') : '';
        document.getElementById('meal-image').value = '';
        document.getElementById('meal-image').required = false;

        modalTitle.textContent = 'Edit Meal';
        submitBtn.textContent = 'Update Meal';
        modal.style.display = 'block';
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;
        const mealId = form.dataset.editingId;
        const isEditing = !!mealId;

        const strMeal = document.getElementById('meal-name').value;
        const price = parseFloat(document.getElementById('meal-price').value);

        if (!strMeal || !price || price <= 0) {
            showToast('Please fill in the Meal Name and a valid Price.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('strMeal', strMeal);
        formData.append('strCategory', document.getElementById('meal-category').value);
        formData.append('price', price);
        formData.append('isAvailable', document.getElementById('meal-available').checked);
        formData.append('isCustom', true);
        formData.append('ingredients', document.getElementById('meal-ingredients').value);

        if (!isEditing && form.dataset.baseMealId) {
            // Genera un ID custom basato sul piatto originale
            formData.append('idMeal', `${form.dataset.baseMealId}_custom_${Date.now()}`);
            formData.append('strMealThumb', form.dataset.baseMealThumb);
        }

        const mealImageInput = document.getElementById('meal-image');
        if (mealImageInput.files.length > 0) {
            formData.append('mealImage', mealImageInput.files[0]);
        }

        const url = isEditing ? `/api/meals/${mealId}` : `/api/meals`;

        try {
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error saving the meal.');
            }

            if (!isEditing && restaurantId) {
                // Ricostruisce mealData per il menu restaurant add
                const summaryMealData = {
                    price: price,
                    isAvailable: document.getElementById('meal-available').checked
                };
                await addMealToRestaurantMenu(data.meal || data, summaryMealData);
            }

            closeModal();
            showToast(isEditing ? 'Meal updated!' : 'Meal created successfully!', 'success');
            fetchMeals(true);

        } catch (error) {
            console.error(error);
            showToast(error.message, 'danger');
        }
    }

    const addMealToRestaurantMenu = async (createdMeal, mealData) => {
        try {
            const menuItemData = {
                idMeal: createdMeal._id,
                price: mealData.price,
                preparationTime: 15,
                isAvailable: mealData.isAvailable
            };

            const menuRes = await fetch(`/api/restaurants/${restaurantId}/menu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(menuItemData)
            });

            if (!menuRes.ok) {
                console.warn('Meal created but failed to add to restaurant menu');
            }
        } catch (menuError) {
            console.error('Error adding meal to restaurant menu:', menuError);
        }
    }

    const handleDeleteMeal = async (mealId) => {
        if (!token) return;
        if (!confirm('Are you sure you want to delete this meal?')) {
            return;
        }

        try {
            const res = await fetch(`/api/meals/${mealId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error deleting the meal.');
            }

            showToast('Meal deleted successfully.', 'success');
            fetchMeals(true); // Ricarica piatti personalizzati

        } catch (error) {
            console.error(error);
            showToast(error.message, 'danger');
        }
    }

    const handleSearch = () => {
        if (!token) return;
        const searchTerm = searchInput.value.trim();
        fetchMeals(false, searchTerm); // piatti disponibili
        fetchMeals(true, searchTerm);  // piatti personalizzati
    }

    addMealBtn.addEventListener('click', () => {
        if (token) openModalForCreate();
        else showToast('Please log in to create meals.', 'warning');
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