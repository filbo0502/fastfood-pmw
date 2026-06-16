
// Funzione per ottenere l'URL corretto dell'immagine, gestisce sia immagini esterne che locali
export const getImageUrl = (image, defaultImage = '../images/hamburger.png') => {
    if (!image) return defaultImage;

    // Immagini esterne (da API, ecc)
    if (image.startsWith('http')) {
        return image;
    }

    // Ha già il path completo
    if (image.startsWith('/uploads/')) {
        return image;
    }

    // Assume che tutte le immagini siano nella cartella restaurants 
    return `/uploads/restaurants/${image}`;
};

// Funzione per mostrare toast, gestisce sia Toastify che alert di fallback
export const showToast = (message, type = 'danger') => {
    const bgColor = type === 'success'
        ? 'linear-gradient(to right, #4caf50, #81c784)'
        : type === 'warning'
            ? 'linear-gradient(to right, #ff9800, #ffb74d)'
            : type === 'info'
                ? 'linear-gradient(to right, #0dcaf0, #33ccff)'
                : 'linear-gradient(to right, #f44336, #e57373)';

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "center",
        style: { background: bgColor }
    }).showToast();
};

// Funzione per formattare lo stato di un ordine
export const formatStatus = (status) => {
    if (status === 'delivered') return 'Prepared & Delivered';
    if (status === 'ready') return 'Ready for Pickup';
    return status.charAt(0).toUpperCase() + status.slice(1);
};
