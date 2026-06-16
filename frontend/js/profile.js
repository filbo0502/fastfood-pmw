import { showToast } from "./utils.js";
import { logout } from "./auth.js";

document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('jwtToken');
    const userID = localStorage.getItem('userID');

    if (!token || !userID) {
        console.warn('User not authenticated. Redirecting to login.');
        window.location.href = './login.html';
        return;
    }

    const profileForm = document.getElementById('profile-details-form');
    const addressForm = document.getElementById('address-form');
    const passwordForm = document.getElementById('password-form');
    const paymentForm = document.getElementById('payment-form');

    const nameInput = document.getElementById('name');
    const surnameInput = document.getElementById('surname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    const wantsSpecialOffersInput = document.getElementById('wantsSpecialOffers');
    const favoriteCategoryInput = document.getElementById('favoriteCategory');

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

    // Funzione per ottenere l'icona giusta in base al tipo di carta
    function getCardIconClass(cardType) {
        if (!cardType) return 'fas fa-credit-card';

        if (cardType.toLowerCase() === 'visa') {
            return 'fab fa-cc-visa';
        } else if (cardType.toLowerCase() === 'mastercard') {
            return 'fab fa-cc-mastercard';
        } else if (cardType.toLowerCase() === 'amex') {
            return 'fab fa-cc-amex';
        } else {
            return 'fas fa-credit-card';
        }
    }

    const loadUserData = async () => {
        try {
            const response = await fetch(`/api/user/${userID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('User profile not found. Logging out...');
                    showToast('Your session is invalid or your account was deleted. Logging out...', 'warning');
                    setTimeout(() => { logout(); }, 2000);
                    return;
                }
                throw new Error('Could not load profile data.');
            }

            const user = await response.json();
            currentUserData = user;
            // Popolo i form con i dati
            populateForms(user);

        } catch (error) {
            console.error('Error loading data:', error);
            showToast(error.message, 'danger');
        }
    }

    const populateForms = (user) => {
        if (!user) return;

        // Riempio i campi del profilo
        nameInput.value = user.name || '';
        surnameInput.value = user.surname || '';
        emailInput.value = user.email || '';
        phoneInput.value = user.phone || '';

        // Preferenze
        if (user.preferences) {
            wantsSpecialOffersInput.checked = user.preferences.wantsSpecialOffers || false;
            favoriteCategoryInput.value = user.preferences.favoriteCategory || '';
        }

        // Riempio i campi dell'indirizzo (se presenti)
        if (user.address) {
            streetInput.value = user.address.street || '';
            cityInput.value = user.address.city || '';
            zipInput.value = user.address.zipCode || '';
        }

        // Gestione metodo di pagamento
        if (user.paymentInfo && user.paymentInfo.cardNumb) {
            // Se ha un metodo di pagamento salvato, mostro la visualizzazione
            paymentDisplayView.classList.remove('d-none');
            paymentFormView.classList.add('d-none');

            const { cardType, cardNumb, CVC, expiryDate } = user.paymentInfo;

            // Mostro solo le ultime 4 cifre della carta
            const lastFour = cardNumb.slice(-4);
            savedCardIcon.className = `${getCardIconClass(cardType)} fa-2x me-3 text-primary`;
            savedCardDetails.textContent = `${cardType || 'Card'}----${lastFour}`;

            // Formatto la data di scadenza
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
            // Se NON ha un metodo di pagamento, mostro il form vuoto
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
            phone: currentUserData.phone,
            address: currentUserData.address,
            preferences: currentUserData.preferences,
            userType: currentUserData.userType,
            paymentInfo: null
        };

        try {
            const response = await fetch(`/api/user/${userID}`, {
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
            showToast('Payment method removed successfully!', 'success');

        } catch (error) {
            showToast(error.message, 'danger');
        }
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserData) return;

        // Preparo i dati da inviare
        const payload = {
            name: nameInput.value,
            surname: surnameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            address: currentUserData.address,
            paymentInfo: currentUserData.paymentInfo,
            preferences: {
                wantsSpecialOffers: wantsSpecialOffersInput.checked,
                favoriteCategory: favoriteCategoryInput.value
            },
            userType: currentUserData.userType
        };

        try {
            const response = await fetch(`/api/user/${userID}`, {
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
            showToast('Profile details updated!', 'success');

        } catch (error) {
            showToast(error.message, 'danger');
        }
    });

    addressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserData) return;

        const payload = {
            name: currentUserData.name,
            surname: currentUserData.surname,
            email: currentUserData.email,
            phone: currentUserData.phone,
            paymentInfo: currentUserData.paymentInfo,
            preferences: currentUserData.preferences,
            userType: currentUserData.userType,
            address: {
                street: streetInput.value,
                city: cityInput.value,
                zipCode: zipInput.value
            }
        };

        try {
            const response = await fetch(`/api/user/${userID}`, {
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
            showToast('Address updated successfully!', 'success');

        } catch (error) {
            showToast(error.message, 'danger');
        }
    });

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserData) return;

        // Converto la data di scadenza in un oggetto Date
        let expiryDateObj = null;
        if (expiryDateInput.value) {
            try {
                const parts = expiryDateInput.value.split('/');
                const year = Number(parts[0]);
                const month = Number(parts[1]);
                expiryDateObj = new Date(year, month, 0);
            } catch (e) {
                console.error('Invalid date format');
                showToast('Expiry date not valid.', 'danger');
                return;
            }
        }

        const payload = {
            name: currentUserData.name,
            surname: currentUserData.surname,
            email: currentUserData.email,
            phone: currentUserData.phone,
            address: currentUserData.address,
            preferences: currentUserData.preferences,
            userType: currentUserData.userType,
            paymentInfo: {
                cardType: cardTypeInput.value,
                cardNumb: cardNumbInput.value,
                CVC: CVCInput.value,
                expiryDate: expiryDateObj
            }
        };

        try {
            const response = await fetch(`/api/user/${userID}`, {
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
            showToast('Payment info updated successfully!', 'success');

        } catch (error) {
            showToast(error.message, 'danger');
        }
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPassword = currentPassInput.value;
        const newPassword = newPassInput.value;
        const confirmNewPassword = confirmPassInput.value;

        if (newPassword !== confirmNewPassword) {
            showToast('The new passwords do not match.', 'danger');
            return;
        }

        try {
            const response = await fetch(`/api/user/${userID}/password`, {
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

            showToast('Password updated successfully!', 'success');

            // Pulisco i campi
            currentPassInput.value = '';
            newPassInput.value = '';
            confirmPassInput.value = '';

        } catch (error) {
            showToast(error.message, 'danger');
        }
    });

    // Quando clicchi su "Yes, Delete" per eliminare l'account
    deleteBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/user/${userID}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Could not delete the account.');
            }

            showToast('Account deleted successfully. You will be logged out.', 'success');
            setTimeout(() => { logout(); }, 2000);

        } catch (error) {
            showToast(error.message, 'danger');
        } finally {
            const modal = document.getElementById('deleteConfirmModal');
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }
    });

    loadUserData();
});