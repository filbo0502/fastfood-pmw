export const nameRegex = /^[a-zA-Z\s]+$/; // Solo lettere e spazi
export const surnameRegex = /^[a-zA-Z\s-]+$/; // Lettere, spazi, e trattini
export const emailRegex = /^\S+@\S+\.\S+$/; // Formato email semplice
export const passwordRegex = /^.{8,}$/; // Almeno 8 caratteri