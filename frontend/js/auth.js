
// Decodifica il token e controlla se non è scaduto
const getValidTokenPayload = (token) => {
    try {
        const payloadStr = token.split('.')[1];
        if (!payloadStr) return null;

        const payload = JSON.parse(atob(payloadStr));

        // Se è scaduto (scadenza in secondi)
        if (payload.exp && (Date.now() / 1000) > payload.exp) {
            return null;
        }
        return payload;
    } catch {
        return null;
    }
};

// pulisce tutto e manda al login se serve
const clearSessionAndRedirect = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userID');
    localStorage.removeItem('userType');
    localStorage.removeItem('restaurantId');

    // non rendirizza se siamo già nella pagina di login o registrazione
    const p = window.location.pathname;
    if (!p.includes('login.html') && !p.includes('registration.html')) {
        window.location.href = '../pages/login.html';
    }
};

// logout effettivo dal server
export const logout = async () => {
    try {
        await fetch(`/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Logout error:', err);
    }

    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userID');
    localStorage.removeItem('userType');
    localStorage.removeItem('restaurantId');
    window.location.href = '../pages/login.html';
};

// controlla che l'utente sia un autenticato e sia un ristoratore
export const requireRestaurateurAuth = () => {
    const token = localStorage.getItem('jwtToken');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'restaurateur') {
        console.warn('User not authenticated or not a restaurateur. Redirecting to login.');
        window.location.href = './login.html';
    }
};

// gestisce la visualizzazione dei bottoni navbar quando carica la pagina
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.querySelector('.login-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    const profileBtn = document.querySelector('.my-profile-btn');
    const restaurantBtn = document.querySelector('.my-restaurant-btn');
    const ordersBtn = document.querySelector('.my-orders-btn');
    const cartLink = document.querySelector('.cart-link');

    const token = localStorage.getItem('jwtToken');
    const userType = localStorage.getItem('userType');

    const payload = token ? getValidTokenPayload(token) : null;

    if (payload) {
        if (loginBtn) loginBtn.classList.add('d-none');
        if (logoutBtn) logoutBtn.classList.remove('d-none');
        if (profileBtn) profileBtn.classList.remove('d-none');
        if (cartLink) cartLink.classList.remove('d-none');

        if (userType === 'restaurateur') {
            if (restaurantBtn) restaurantBtn.classList.remove('d-none');
            if (ordersBtn) ordersBtn.classList.add('d-none');
            if (cartLink) cartLink.classList.add('d-none');
        } else {
            if (restaurantBtn) restaurantBtn.classList.add('d-none');
            if (ordersBtn) ordersBtn.classList.remove('d-none');
        }
    } else {
        // token scaduto o non loggato
        if (token) {
            clearSessionAndRedirect();
            return;
        }

        // Mostra solo login, nascondendo gli altri bottoni
        if (loginBtn) loginBtn.classList.remove('d-none');
        if (logoutBtn) logoutBtn.classList.add('d-none');
        if (profileBtn) profileBtn.classList.add('d-none');
        if (restaurantBtn) restaurantBtn.classList.add('d-none');
        if (ordersBtn) ordersBtn.classList.add('d-none');
        if (cartLink) cartLink.classList.add('d-none');
    }

    // Evento botton logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});