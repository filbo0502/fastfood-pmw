export const nameRegex = /^[a-zA-Z\s]+$/; // Solo lettere e spazi
export const surnameRegex = /^[a-zA-Z\s-]+$/; // Lettere, spazi, e trattini
export const emailRegex = /^\S+@\S+\.\S+$/; // Formato email semplice
export const passwordRegex = /^.{8,}$/; // Almeno 8 caratteri

// Effettua l'escape dei caratteri speciali regex nell'input utente per prevenire ReDoS
export const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};