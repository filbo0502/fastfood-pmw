import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import Restaurant from "../models/Restaurant.js";
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/restaurants';
        // Crea la cartella se non esiste
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Genera un nome file unico
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'restaurant-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accetta solo file immagine
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

/**
 * @desc    Upload an image with multer library
 * @route   POST /api/auth/login
 * @access  Public
 */
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

/**
 * @desc    Registrazione utente (Cliente o Ristoratore)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { name, surname, email, password, confirmPassword, userType } = req.body;

    if (!name || !surname || !email || !password || !confirmPassword || !userType) {
        return res.status(400).json({ message: "Tutti i campi utente sono obbligatori." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Le password non coincidono." });
    }

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
            const {
                restaurantName,
                vatNumber,
                phone,
                addressStreet,
                addressCity,
                addressZip,
                description
            } = req.body;

            if (!restaurantName || !vatNumber || !phone || !addressStreet || !addressCity || !addressZip) {
                await User.findByIdAndDelete(user._id); 
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ message: 'For restaurateurs, all restaurant fields are required.' });
            }

            const restaurantData = {
                name: restaurantName,
                vatNumber: vatNumber, 
                phone: phone,
                address: {
                    street: addressStreet,
                    city: addressCity,
                    zipCode: addressZip,
                },
                owner: user._id,
                description: description || `Welcome at ${restaurantName}`
            };

            if (req.file) {
                restaurantData.image = `/uploads/restaurants/${req.file.filename}`;
            }

            const newRestaurant = new Restaurant(restaurantData);
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
            message: "User created successfully!", 
            token 
        });

    } catch (error) {
        console.error("Error during the registration:", error);
    
        if(user && user._id) {
            await User.findByIdAndDelete(user._id);
        }

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: "Errore durante la creazione dell'utente." });
    }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password." });
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
        message: 'Login success!',
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            userType: user.userType
        }
    });
});

/**
 * @desc    Logout user
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