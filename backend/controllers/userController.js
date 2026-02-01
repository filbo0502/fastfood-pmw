import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

/**
 * @desc Ottiene un utente
 * @route GET /api/user
 * @access Public
 */
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
});

/**
 * @desc Aggiorna un utente
 * @route PUT /api/user
 * @access Private
 */
export const updateUser = asyncHandler(async (req, res) => {
    const updateFields = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        userType: req.body.userType,
        paymentInfo: req.body.paymentInfo,
        address: req.body.address
    };

    if (req.body.password && req.body.password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        updateFields.password = hashedPassword;
    };

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
});

/**
 * @desc  Elimina un utente
 * @route DELETE /api/user
 * @access Private
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(user._id);
    res.status(200).json({ message: 'User deleted!' });
});

/**
 * @desc Aggiorna la password di un utente
 * @route PUT /api/user/password
 * @access Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password successfully updated.' })
});
