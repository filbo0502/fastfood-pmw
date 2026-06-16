import { showToast } from "./utils.js";


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userExistsModal')) {
        window.userExistsModal = new bootstrap.Modal(document.getElementById('userExistsModal'));
    }
    if (document.getElementById('validationErrorModal')) {
        window.validationErrorModal = new bootstrap.Modal(document.getElementById('validationErrorModal'));
    }
    if (document.getElementById('genericErrorModal')) {
        window.genericErrorModal = new bootstrap.Modal(document.getElementById('genericErrorModal'));
    }

    initializeRegistrationForm();

    const userTypeSelect = document.getElementById('userType');
    const customerFields = document.getElementById('customerFields');
    const restaurantFields = document.getElementById('restaurantFields');

    if (userTypeSelect && customerFields && restaurantFields) {
        const customerInputs = customerFields.querySelectorAll('input');
        const restaurantInputs = restaurantFields.querySelectorAll('input:not([type="file"]):not([id="restaurantImage"])');

        // Mostra/nascondi campi in base al tipo di utente selezionato
        userTypeSelect.addEventListener('change', (e) => {
            const userType = e.target.value;
            const isCustomer = userType === 'customer';
            const isRestaurateur = userType === 'restaurateur';

            customerFields.style.display = isCustomer ? 'block' : 'none';
            restaurantFields.style.display = isRestaurateur ? 'block' : 'none';

            const commonFields = document.getElementById('commonFields');
            if (commonFields) {
                commonFields.style.display = (isCustomer || isRestaurateur) ? 'block' : 'none';
            }

            // Imposta l'attributo required in base alla selezione
            customerInputs.forEach(input => {
                if (input.type !== 'file') {
                    input.required = isCustomer;
                }
            });

            restaurantInputs.forEach(input => {
                if (input.type !== 'file') {
                    input.required = isRestaurateur;
                }
            });
        });
    }
});

const showValidationError = (message) => {
    if (window.validationErrorModal) {
        const modalText = document.getElementById('validationErrorText');
        if (modalText) {
            modalText.textContent = message;
        }
        window.validationErrorModal.show();
    } else {
        alert(message);
    }
}

const initializeRegistrationForm = () => {
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    } else {
        console.error('Form element with ID "registrationForm" not found.');
    }
}

const handleRegistration = async (event) => {
    event.preventDefault();
    const registrationForm = document.getElementById('registrationForm');
    const registerButton = registrationForm.querySelector('button[type="submit"]');
    const spinner = registerButton.querySelector('.spinner-border');

    registerButton.disabled = true;
    if (spinner) spinner.classList.remove('d-none');

    const enableButton = () => {
        registerButton.disabled = false;
        if (spinner) spinner.classList.add('d-none');
    };

    const userType = document.getElementById('userType').value;

    if (!userType) {
        showValidationError("Please select a user type.");
        enableButton();
        return;
    }

    let name, surname, email, phone, password, confirmPassword;

    if (userType === 'customer') {
        name = document.getElementById('customerName').value.trim();
        surname = document.getElementById('customerSurname').value.trim();
        email = document.getElementById('customerEmail').value.trim();
        phone = document.getElementById('customerPhone').value.trim();
        password = document.getElementById('customerPassword').value;
        confirmPassword = document.getElementById('customerConfirmPassword').value;
    } else {
        name = document.getElementById('restaurantUserName').value.trim();
        surname = document.getElementById('restaurantUserSurname').value.trim();
        email = document.getElementById('restaurantUserEmail').value.trim();
        phone = document.getElementById('phone').value.trim();
        password = document.getElementById('restaurantUserPassword').value;
        confirmPassword = document.getElementById('restaurantUserConfirmPassword').value;
    }

    if (!name || !surname || !email || !phone || !password || !confirmPassword) {
        showValidationError("All fields are mandatory.");
        enableButton();
        return;
    }

    if (password.length < 8) {
        showValidationError("Password must be at least 8 characters long.");
        enableButton();
        return;
    }

    if (password !== confirmPassword) {
        showValidationError("Passwords do not match.");
        enableButton();
        return;
    }

    const addressStreet = document.getElementById('addressStreet').value.trim();
    const addressCity = document.getElementById('addressCity').value.trim();
    const addressZip = document.getElementById('addressZip').value.trim();
    const wantsSpecialOffers = document.getElementById('wantsSpecialOffers').checked;
    const favoriteCategory = document.getElementById('favoriteCategory').value;

    if (!addressStreet || !addressCity || !addressZip) {
        showValidationError("Address fields are required.");
        enableButton();
        return;
    }

    // Costruisce i dati del form - uso FormData per supportare l'upload di immagini
    const formData = new FormData();
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('userType', userType);
    formData.append('addressStreet', addressStreet);
    formData.append('addressCity', addressCity);
    formData.append('addressZip', addressZip);
    formData.append('wantsSpecialOffers', wantsSpecialOffers);
    if (favoriteCategory) {
        formData.append('favoriteCategory', favoriteCategory);
    }

    if (userType === 'restaurateur') {
        const restaurantName = document.getElementById('restaurantName').value.trim();
        const vatNumber = document.getElementById('vatNumber').value.trim();

        if (!restaurantName || !vatNumber) {
            showValidationError("For restaurateurs, restaurant name and VAT number are required.");
            enableButton();
            return;
        }

        formData.append('restaurantName', restaurantName);
        formData.append('vatNumber', vatNumber);

        const restaurantImageInput = document.getElementById('restaurantImage');
        if (restaurantImageInput && restaurantImageInput.files.length > 0) {
            formData.append('restaurantImage', restaurantImageInput.files[0]);
        }
    }

    try {
        const response = await fetch(`/api/auth/register`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Registration successful! You will be redirected to the login page.", "success");
            setTimeout(() => { window.location.href = './login.html'; }, 3000);
        } else {
            if (response.status === 409) {
                if (window.userExistsModal) window.userExistsModal.show();
            } else {
                showValidationError(data.message || 'The data provided is invalid.');
            }
            enableButton();
        }
    } catch (error) {
        console.error('Registration error', error);
        if (window.genericErrorModal) window.genericErrorModal.show();
        enableButton();
    }
}