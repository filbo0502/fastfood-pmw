import { showToast } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    const credModalEl = document.getElementById('credentialsModal');
    if (credModalEl) {
        window.credentialsModal = new bootstrap.Modal(credModalEl);
    }
    const userNotFoundModalEl = document.getElementById('userNotFoundModal');
    if (userNotFoundModalEl) {
        window.userNotFoundModal = new bootstrap.Modal(userNotFoundModalEl);
    }
    const genericErrorModalEl = document.getElementById('genericErrorModal');
    if (genericErrorModalEl) {
        window.genericErrorModal = new bootstrap.Modal(genericErrorModalEl);
    }
});

const loginForm = document.getElementById('login_form');

const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validazione email base prima di inviare al server
    if (!validateEmail(email)) {
        showToast("Invalid email format. Please enter a valid email address.", "error");
        return;
    }

    const loginButton = loginForm.querySelector('button[type="submit"]');
    const spinner = loginButton.querySelector('.spinner-border');
    loginButton.disabled = true;
    if (spinner) {
        spinner.classList.remove('d-none');
    }

    try {
        const response = await fetch(`/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva il token di autenticazione
            localStorage.setItem('jwtToken', data.token);
            if (data.user && data.user.id) {
                localStorage.setItem('userID', data.user.id);
            }
            if (data.user.userType) {
                localStorage.setItem('userType', data.user.userType);
            }
            if (data.restaurantId) {
                localStorage.setItem('restaurantId', data.restaurantId);
            }

            showToast("Login successful!", "success");

            // Aspetta un po' prima del redirect così l'utente vede il messaggio di successo
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);
        } else {
            if (response.status === 404) {
                if (window.userNotFoundModal) window.userNotFoundModal.show();
            } else if (response.status === 401) {
                if (window.credentialsModal) window.credentialsModal.show();
            } else {
                showGenericError(data.message || 'An unexpected error occurred.');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showGenericError('Could not connect to the server. Please check your connection and try again.');
    } finally {
        loginButton.disabled = false;
        if (spinner) spinner.classList.add('d-none');
    }
}

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const showGenericError = (message) => {
    if (window.genericErrorModal) {
        const modalText = document.querySelector('#genericErrorModal .modal-body p');
        if (modalText) modalText.textContent = message;
        window.genericErrorModal.show();
    } else {
        alert(message);
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
} else {
    console.error('Form element with ID "login_form" not found.');
}
