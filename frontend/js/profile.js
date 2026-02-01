import CONFIG from "./config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('jwtToken');
    const userID = localStorage.getItem('userID');

    if (!token || !userID) {
        console.warn('User not authenticated. Redirecting to login.');
        window.location.href = './login.html';
        return;
    }

    // Selettori Form
    const profileForm = document.getElementById('profile-details-form');
    const addressForm = document.getElementById('address-form');
    const passwordForm = document.getElementById('password-form');
    const paymentForm = document.getElementById('payment-form');

    // Selettori Campi
    const nameInput = document.getElementById('name');
    const surnameInput = document.getElementById('surname');
    const emailInput = document.getElementById('email');

    const streetInput = document.getElementById('street');
    const cityInput = document.getElementById('city');
    const zipInput = document.getElementById('zipCode');

    const currentPassInput = document.getElementById('currentPassword');
    const newPassInput = document.getElementById('newPassword');
    const confirmPassInput = document.getElementById('confirmPassword');

    const deleteBtn = document.getElementById('confirmDeleteBtn');

    const cardTypeInput = document.getElementById('cardType');
    const cardNumbInput = document.getElementById('cardNumb');
    const CVCInput = document.getElementById('CVC');
    const expiryDateInput = document.getElementById('expiryDate');

    const paymentDisplayView = document.getElementById('payment-display-view');
    const paymentFormView = document.getElementById('payment-form-view');
    const editPaymentBtn = document.getElementById('edit-payment-btn');
    const removePaymentBtn = document.getElementById('remove-payment-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const savePaymentBtn = document.getElementById('save-payment-btn');
    const paymentFormIntro = document.getElementById('payment-form-intro');

    const savedCardIcon = document.getElementById('saved-card-icon');
    const savedCardDetails = document.getElementById('saved-card-details');
    const savedCardExpiry = document.getElementById('saved-card-expiry');

    let currentUserData = null;

    // Restituisce la classe icona corretta in base al tipo di carta
    function getCardIconClass(cardType) {
        if (!cardType) return 'fas fa-credit-card';
        switch (cardType.toLowerCase()) {
            case 'visa': return 'fab fa-cc-visa';
            case 'mastercard': return 'fab fa-cc-mastercard';
            case 'amex': return 'fab fa-cc-amex';
            default: return 'fas fa-credit-card';
        }
    }

    async function loadUserData() {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Could not load profile data.');
            }

            const user = await response.json();
            currentUserData = user;
            populateForms(user);

        } catch (error) {
            console.error('Error loading data:', error);
            showAlert(error.message, 'danger');
        }
    }

    function populateForms(user) {
        if (!user) return;

        nameInput.value = user.name || '';
        surnameInput.value = user.surname || '';
        emailInput.value = user.email || '';

        if (user.address) {
            streetInput.value = user.address.street || '';
            cityInput.value = user.address.city || '';
            zipInput.value = user.address.zipCode || '';
        }

        if (user.paymentInfo && user.paymentInfo.cardNumb) {
            paymentDisplayView.classList.remove('d-none');
            paymentFormView.classList.add('d-none');

            const { cardType, cardNumb, CVC, expiryDate } = user.paymentInfo;

            const lastFour = cardNumb.slice(-4);
            savedCardIcon.className = `${getCardIconClass(cardType)} fa-2x me-3 text-primary`;
            savedCardDetails.textContent = `${cardType || 'Card'}----${lastFour}`;

            // Formatta la data di scadenza
            let expiryText = 'Expire in: --/--';
            if (expiryDate) {
                try {
                    const date = new Date(expiryDate);
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = String(date.getFullYear()).slice(-2);
                    expiryText = `Expire in ${month}/${year}`;

                    const formYear = date.getFullYear();
                    expiryDateInput.value = `${formYear}/${month}`;
                } catch (e) {
                    console.warn('Could not parse expiryDate:', expiryDate);
                }
            }
            savedCardExpiry.textContent = expiryText;

            cardTypeInput.value = cardType || '';
            cardNumbInput.value = cardNumb || '';
            CVCInput.value = CVC || '';

        } else {
            paymentDisplayView.classList.add('d-none');
            paymentFormView.classList.remove('d-none');
            cancelEditBtn.classList.add('d-none');
            paymentFormIntro.textContent = 'You don\'t have any payment method saved.';
            savePaymentBtn.textContent = 'Save Payment method';

            paymentForm.reset();
        }
    }

    editPaymentBtn.addEventListener('click', () => {
        paymentDisplayView.classList.add('d-none');
        paymentFormView.classList.remove('d-none');

        cancelEditBtn.classList.remove('d-none');
        paymentFormIntro.textContent = 'Modify your payment method.';
        savePaymentBtn.textContent = 'Save Edit';
    });

    cancelEditBtn.addEventListener('click', () => {
        populateForms(currentUserData);
    });

    removePaymentBtn.addEventListener('click', async () => {
        if (!currentUserData) return;

        if (!confirm('Are you sure you want to remove this payment method?')) {
            return;
        }

        const payload = {
            name: currentUserData.name,
            surname: currentUserData.surname,
            email: currentUserData.email,
            address: currentUserData.address,
            userType: currentUserData.userType,
            paymentInfo: null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error during remove.');
            }

            currentUserData = data.user;
            populateForms(currentUserData);
            showAlert('Payment method removed successfully!', 'success');

        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });


    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserData) return;

        const payload = {
            name: nameInput.value,
            surname: surnameInput.value,
            email: emailInput.value,
            address: currentUserData.address,
            paymentInfo: currentUserData.paymentInfo,
            userType: currentUserData.userType
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error updating details.');
            }

            currentUserData = data.user;
            populateForms(currentUserData);
            showAlert('Profile details updated!', 'success');

        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });

    addressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserData) return;

        const payload = {
            name: currentUserData.name,
            surname: currentUserData.surname,
            email: currentUserData.email,
            paymentInfo: currentUserData.paymentInfo,
            userType: currentUserData.userType,
            address: {
                street: streetInput.value,
                city: cityInput.value,
                zipCode: zipInput.value
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error updating address.');
            }

            currentUserData = data.user;
            populateForms(currentUserData);
            showAlert('Address updated successfully!', 'success');

        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserData) return;

        let expiryDateObj = null;
        if (expiryDateInput.value) {
            try {
                const [year, month] = expiryDateInput.value.split('/').map(Number);
                expiryDateObj = new Date(year, month, 0);
            } catch (e) {
                console.error('Invalid date format');
                showAlert('Expiry date not valid.', 'danger');
                return;
            }
        }

        const payload = {
            name: currentUserData.name,
            surname: currentUserData.surname,
            email: currentUserData.email,
            address: currentUserData.address,
            userType: currentUserData.userType,
            paymentInfo: {
                cardType: cardTypeInput.value,
                cardNumb: cardNumbInput.value,
                CVC: CVCInput.value,
                expiryDate: expiryDateObj
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error updating payment info.');
            }

            currentUserData = data.user;
            populateForms(currentUserData);
            showAlert('Payment info updated successfully!', 'success');

        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPassword = currentPassInput.value;
        const newPassword = newPassInput.value;
        const confirmNewPassword = confirmPassInput.value;

        if (newPassword !== confirmNewPassword) {
            showAlert('The new passwords do not match.', 'danger');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/${userID}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword, confirmNewPassword })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error updating password.');
            }

            showAlert('Password updated successfully!', 'success');
            currentPassInput.value = '';
            newPassInput.value = '';
            confirmPassInput.value = '';

        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });

    deleteBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userID}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Could not delete the account.');
            }

            alert('Account deleted successfully. You will be logged out.');
            logout();

        } catch (error) {
            const modalEl = document.getElementById('deleteConfirmModal');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
            showAlert(error.message, 'danger');
        }
    });

    function showAlert(message, type) {
        const container = document.querySelector('.main-section .container');
        if (!container) return;

        const existingAlert = container.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
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

    async function logout() {
        try {
            const token = localStorage.getItem('jwtToken');
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error calling server logout:', error);
        } finally {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userID');
            localStorage.removeItem('userType');
            localStorage.removeItem('restaurantId');
            window.location.href = '../index.html';
        }
    }

    loadUserData();
});