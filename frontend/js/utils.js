import CONFIG from "./config.js";

export const getAuthToken = () => localStorage.getItem('jwtToken');
export const getUserID = () => localStorage.getItem('userID');
export const getUserType = () => localStorage.getItem('userType');

export const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const checkAuth = (requiredRole = null, redirect = true) => {
    const token = getAuthToken();
    const userType = getUserType();

    if (!token) {
        if (redirect) window.location.href = '../pages/login.html';
        return false;
    }

    if (requiredRole && userType !== requiredRole) {
        if (redirect) window.location.href = '../index.html';
        return false;
    }
    return true;
};

export const apiFetch = async (endpoint, options = {}) => {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;

    const headers = { ...getAuthHeaders(), ...options.headers };
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            console.warn('Session expired or unauthorized');
            localStorage.clear();
            window.location.href = '../pages/login.html';
            throw new Error('Unauthorized');
        }

        return response;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
};

export const showToast = (text, type = 'success') => {
    const bgColors = {
        success: "linear-gradient(to right, #4caf50, #81c784)",
        error: "#dc3545",
        warning: "#ffc107",
        info: "#17a2b8"
    };

    if (typeof Toastify !== 'undefined') {
        Toastify({
            text,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            style: { background: bgColors[type] || bgColors.success }
        }).showToast();
    } else {
        alert(text);
    }
};
