import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from 'express-async-handler';

export const register = asyncHandler(async(req, res) => {
    console.log('Data received: ', req.body);
    const { name, surname, email, password, confirmPassword, isRestaurateur } = req.body;
    if (!name || !surname || !email || !password || !confirmPassword || !isRestaurateur) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if(password != confirmPassword){
        return res.status(400).json({ message: "Password do not match" });
    }

    const existingUser = await User.findOne({ email });
    if(existingUser){
        console.log("User already exists for the email: ", email);
        return res.status(400).json({ message: "User already exists" }); 
    }

    try{
        const newUser = new User({
            name,
            surname,
            email,
            password,
            isRestaurateur
        });
        await newUser,save()

        const tokenDuration = 2 * 3600000;
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "2h"});
        res.cookie('jwtToken', token, {
            hhtpOnly: true,
            sameSite: 'lax',
            expires: new Date(Date.now() + tokenDuration)
        });
        res.status(201).json({ success: true, message: "User created successfully", token });
    }catch(error){
        console.error("Errror durig user registration: ", error);
        res.status(500).json({ success: false, message: "Error creating user" });
    }
});

export const login = asyncHandler(async (req,res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if(!user){
        return res.status(400).json({ succes: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        console.log('Incorrect password');
        return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    const tokenDuration = 2 * 3600000;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: '2h'});
    res.cookie('jwtToken', token, {
        hhtpOnly: true,
        sameSite: 'lax',
        expires: new Date(Date.now() + tokenDuration)
    });
    res.status(200).json({ succes: true, message: 'Login successful', token, id: user._id.toString() });
});

export const logout = asyncHandler(async (req,res) => {
    res.clearCookie('jwtToken');
    res.json({ message: 'Logout successful' });
});