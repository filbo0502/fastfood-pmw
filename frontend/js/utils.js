import CONFIG from "./config.js";

export const getImageUrl = (image, defaultImage = '../images/hamburger.png') => {
    if (!image) return defaultImage;

    if (image.startsWith('http')) {
        return image;
    }

    if (image.startsWith('/uploads/')) {
        return `${CONFIG.API_BASE_URL.replace('/api', '')}${image}`;
    }

    return `${CONFIG.API_BASE_URL.replace('/api', '')}/uploads/restaurants/${image}`;
};
