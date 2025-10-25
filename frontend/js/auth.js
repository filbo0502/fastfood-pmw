document.addEventListener('DOMContentLoaded', () => {
    const loginItem = document.querySelector('.login-btn');
    const logoutItem = document.querySelector('.logout-btn');
    
    if (!loginItem || !logoutItem) {
        console.error('Elementi login-btn o logout-btn non trovati');
        return;
    }
    
    const token = localStorage.getItem('jwtToken');
    
    if(token){
        loginItem.classList.add('d-none');
        logoutItem.classList.remove('d-none');
    } else {
        loginItem.classList.remove('d-none');
        logoutItem.classList.add('d-none');
    }
    
    logoutItem.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userID');
    });
});