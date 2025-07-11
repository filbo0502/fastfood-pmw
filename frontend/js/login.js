import CONFIG from "./config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('credentialsModal')) {
        window.credentialsModal = new bootstrap.Modal(document.getElementById('credentialsModal'));
    }
    if (document.getElementById('userNotFoundModal')) {
        window.userNotFoundModal = new bootstrap.Modal(document.getElementById('userNotFoundModal'));
    }
    if (document.getElementById('genericErrorModal')) {
        window.genericErrorModal = new bootstrap.Modal(document.getElementById('genericErrorModal'));
    }
});

const loginForm = document.getElementById('login_form');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
} else {
    console.error('Form element with ID "login_form" not found.');
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validateEmail(email)) {
        showGenericError('Invalid email format. Please enter a valid email address.');
        return;
    }

    const loginButton = loginForm.querySelector('button[type="submit"]');
    const spinner = loginButton.querySelector('.spinner-border');
    loginButton.disabled = true;
    if (spinner) {
        spinner.classList.remove('d-none');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            if (data.user && data.user.id) {
                localStorage.setItem('userID', data.user.id);
            }

            Toastify({
                text: "Login successful!",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #4caf50, #81c784)",
                }
            }).showToast();

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

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showGenericError(message) {
    if (window.genericErrorModal) {
        const modalText = document.querySelector('#genericErrorModal .modal-body p');
        if (modalText) modalText.textContent = message;
        window.genericErrorModal.show();
    } else {
        alert(message);
    }
}

