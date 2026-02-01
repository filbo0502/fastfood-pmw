import CONFIG from "./config.js";

// Funzione helper per ottenere l'URL corretto dell'immagine - gestisce sia immagini esterne che locali
export const getImageUrl = (image, defaultImage = '../images/hamburger.png') => {
    if (!image) return defaultImage;

    // Immagini esterne (da API, ecc)
    if (image.startsWith('http')) {
        return image;
    }

    // Ha già il path completo
    if (image.startsWith('/uploads/')) {
        return `${CONFIG.API_BASE_URL.replace('/api', '')}${image}`;
    }

    // Assume che tutte le immagini siano nella cartella restaurants 
    return `${CONFIG.API_BASE_URL.replace('/api', '')}/uploads/restaurants/${image}`;
};
