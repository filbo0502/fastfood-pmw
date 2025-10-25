import CONFIG from "./config.js";

const API_BASE_URL = CONFIG.API_BASE_URL;

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
    const restaurantFields = document.getElementById('restaurantFields');
    if (userTypeSelect && restaurantFields) {
        const restaurantInputs = restaurantFields.querySelectorAll('input');
        userTypeSelect.addEventListener('change', (e) => {
            const isRestaurateur = e.target.value === 'restaurateur';
            restaurantFields.style.display = isRestaurateur ? 'block' : 'none';
            restaurantInputs.forEach(input => {
                input.required = isRestaurateur;
            });
        });
    }
});

function showValidationError(message) {
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

async function handleRegistration(event) {
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

    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const userType = document.getElementById('userType').value;

    if (!name || !surname || !email || !password || !confirmPassword || !userType) {
        showValidationError("All user fields are mandatory.");
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

    const formData = new FormData();
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('userType', userType);

    if (userType === 'restaurateur') {
        const restaurantName = document.getElementById('restaurantName').value.trim();
        const vatNumber = document.getElementById('vatNumber').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const addressStreet = document.getElementById('addressStreet').value.trim();
        const addressCity = document.getElementById('addressCity').value.trim();
        const addressZip = document.getElementById('addressZip').value.trim();

        if (!restaurantName || !vatNumber || !phone || !addressStreet || !addressCity || !addressZip) {
            showValidationError("For restaurateurs, all restaurant data is required.");
            enableButton();
            return;
        }

        formData.append('restaurantName', restaurantName);
        formData.append('vatNumber', vatNumber);
        formData.append('phone', phone);
        formData.append('addressStreet', addressStreet);
        formData.append('addressCity', addressCity);
        formData.append('addressZip', addressZip);

        const restaurantImageInput = document.getElementById('restaurantImage');
        if (restaurantImageInput && restaurantImageInput.files.length > 0) {
            formData.append('restaurantImage', restaurantImageInput.files[0]);
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            Toastify({
                text: "Registration successful! You will be redirected to the login page.",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: { background: "linear-gradient(to right, #4caf50, #81c784)" }
            }).showToast();
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