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

/**
 * @desc Update user
 * @route PUT /api/user
 * @access Private
 */

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

/**
 * @desc Delete user
 * @route DELETE /api/user
 * @access Private
 */

export const deleteUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ message:'User not found' });
    }
    await User.findByIdAndDelete(user);
    res.status(200).json({message:'User deleted!'});
});

/**
 * @desc Update password
 * @route PUT /api/user/password
 * @access Private
 */

export const updatePassword = asyncHandler(async(req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if(newPassword !== confirmNewPassword){
        return res.status(400).json({ message: 'Passord do not match'});
    }

    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ message: 'User not found.'});
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if(!isMatch){
        return res.status(400).json({ message: 'Incorrect password.'});
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password successfully updated.'})
});

/**
 * @desc Update user preferences
 * @route PUT /api/users/:id/preferences
 * @access Private
 */
export const updateUserPreferences = asyncHandler(async(req, res) => {
    const { favouriteCategories } = req.body;
    
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ message: 'User not found.' });
    }

    if(user._id.toString() !== req.user.id){
        return res.status(403).json({ message: 'Not authorized to update this user.' });
    }

    user.preferences = { favouriteCategories };
    await user.save();

    res.status(200).json({ 
        success: true, 
        message: 'Preferences updated successfully', 
        preferences: user.preferences 
    });
});

/**
 * @desc Get user preferences
 * @route GET /api/users/:id/preferences
 * @access Private
 */
export const getUserPreferences = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ message: 'User not found.' });
    }

    if(user._id.toString() !== req.user.id){
        return res.status(403).json({ message: 'Not authorized to view this user.' });
    }

    res.status(200).json({ preferences: user.preferences });
});
