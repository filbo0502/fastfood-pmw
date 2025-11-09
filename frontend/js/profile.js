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

    const profileForm = document.getElementById('profile-details-form');
    const addressForm = document.getElementById('address-form');
    const paymentForm = document.getElementById('payment-form'); 
    const passwordForm = document.getElementById('password-form');

    const deleteBtn = document.getElementById('confirmDeleteBtn');

    const nameInput = document.getElementById('name');
    const surnameInput = document.getElementById('surname');
    const emailInput = document.getElementById('email');

    const streetInput = document.getElementById('street');
    const cityInput = document.getElementById('city');
    const zipInput = document.getElementById('zipCode');


    const cardTypeInput = document.getElementById('cardType');
    const cardNumbInput = document.getElementById('cardNumb');
    const CVCInput = document.getElementById('CVC')
    const expiryDateInput = document.getElementById('expiryDate');

    // "Password" form fields
    const currentPassInput = document.getElementById('currentPassword');
    const newPassInput = document.getElementById('newPassword');
    const confirmPassInput = document.getElementById('confirmPassword');

    let currentUserData = null;

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

        if (user.paymentInfo) {
            cardTypeInput.value = user.paymentInfo.cardType || '';
            CVCInput.value = user.paymentInfo.CVC || '';
            cardNumbInput.value = user.paymentInfo.cardNumb || '';
            
            if (user.paymentInfo.expiryDate) {
                try {
                    const date = new Date(user.paymentInfo.expiryDate);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    expiryDateInput.value = `${year}-${month}`;
                } catch (e) {
                    console.warn('Could not parse expiryDate:', user.paymentInfo.expiryDate);
                }
            }
        }
    }

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

            currentUserData = data.user; // Update the saved data
            populateForms(currentUserData); // Repopulate
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
                const [year, month] = expiryDateInput.value.split('-').map(Number);
                expiryDateObj = new Date(year, month, 0);
            } catch (e) {
                console.error('Invalid date format');
                showAlert('Invalid expiry date format. Use MM/YYYY.', 'danger');
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
            const response = await fetch(`${API_BASE_URL}/user/${userId}/password`, {
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
            // Clear the fields
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

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        window.location.href = '../index.html';
    }

    /**
     * Displays a dynamic alert on the page.
     * @param {string} message - The message to display.
     * @param {string} type - The alert type (e.g., 'success', 'danger').
     */
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

    loadUserData();

});