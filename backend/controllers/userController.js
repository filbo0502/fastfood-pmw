import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

/**
 * @desc Get user
 * @route GET /api/user
 * @access Public
 */

export const getUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
});

export const updateUser = asyncHandler(async(req, res) => {
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

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateFields, {new: true});

    if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
});

export const deleteUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ message:'User not found' });
    }
    await User.findByIdAndDelete(user);
    res.status(200).json({message:'User deleted!'});
});

export const updatePassword = asyncHandler(async(req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if(newPassword !== confirmNewPassword){
        return res.status(400).json({ message: 'Passord do not match'});
    }

    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ message: 'User not found.'});
    }

    const isMatch = await  bcrypt.compare(oldPassword, user.password);
    if(!isMatch){
        return res.status(400).json({ message: 'Incorrect password.'});
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password successfully updated.'})
})
