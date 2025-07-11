import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import Restaurant from "../models/Restaurant.js";
import asyncHandler from 'express-async-handler';

/**
 * @desc    Registrazione utente (Cliente o Ristoratore)
 * @route   POST /api/auth/register
 * @access  Public
 * @body    { name, surname, email, password, confirmPassword, userType, restaurant: { name, vatNumber, phone, address: { street, city, zipCode } } }
 */
export const register = asyncHandler(async (req, res) => {
    const { name, surname, email, password, confirmPassword, userType, restaurant } = req.body;

    if (!name || !surname || !email || !password || !confirmPassword || !userType) {
        return res.status(400).json({ message: "Tutti i campi utente sono obbligatori." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Le password non coincidono." });
    }

    // Controlla se l'utente esiste già
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(409).json({ message: "Un utente con questa email è già registrato." });
    }

    const user = new User({
        name,
        surname,
        email,
        password,
        userType
    });
    await user.save(); 

    try {
        if (user.userType === 'restaurateur') {
            const { restaurant } = req.body;

            if (!restaurant || !restaurant.name || !restaurant.vatNumber || !restaurant.phone || !restaurant.address || !restaurant.address.street || !restaurant.address.city || !restaurant.address.zipCode) {
                await User.findByIdAndDelete(user._id); 
                return res.status(400).json({ message: 'Per i ristoratori, tutti i dati del ristorante sono obbligatori.' });
            }

            const newRestaurant = new Restaurant({
                name: restaurant.name,
                vatNumber: restaurant.vatNumber, 
                phone: restaurant.phone,
                address: {
                    street: restaurant.address.street,
                    city: restaurant.address.city,
                    zipCode: restaurant.address.zipCode,
                },
                owner: user._id,
                description: restaurant.description || `Welcome at ${restaurant.name}`
            });
            await newRestaurant.save();

            user.restaurant = newRestaurant._id;
            await user.save();
        }

        const tokenDuration = 2 * 3600; 
        const token = jwt.sign({ id: user._id, type: user.userType }, process.env.JWT_SECRET, { expiresIn: tokenDuration });
        
        res.cookie('jwtToken', token, {
            httpOnly: true, 
            sameSite: 'lax',
            maxAge: tokenDuration * 1000 
        });

        res.status(201).json({ 
            success: true, 
            message: "Utente creato con successo!", 
            token 
        });

    } catch (error) {
        console.error("Error during the registration:", error);
        if(user && user._id) {
            await User.findByIdAndDelete(user._id);
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: "Errore durante la creazione dell'utente." });
    }
});


/**
 * @desc    Login utente
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Tutti i campi sono obbligatori." });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "Utente non trovato." }); // Cambiato status a 404
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Password non corretta." }); // Cambiato status a 401
    }

    const tokenDuration = 2 * 3600; // 2 ore in secondi
    const token = jwt.sign({ id: user._id, type: user.userType }, process.env.JWT_SECRET, { expiresIn: tokenDuration });

    res.cookie('jwtToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: tokenDuration * 1000
    });

    res.status(200).json({
        success: true,
        message: 'Login effettuato con successo',
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            userType: user.userType
        }
    });
});

/**
 * @desc    Logout utente
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    res.cookie('jwtToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ success: true, message: 'Logout effettuato con successo' });
});