import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

/**
 * @desc Ottiene un utente
 * @route GET /api/user
 * @access Private
 */
export const getUser = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.description = 'Endpoint per ottenere un utente.' 
    */
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Access denied.' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    
    const userObj = user.toObject();
    if (userObj.paymentInfo?.cardNumb) {
        userObj.paymentInfo.cardNumb = '****' + userObj.paymentInfo.cardNumb.slice(-4);
        delete userObj.paymentInfo.CVC;
    }
    res.status(200).json(userObj);
});

/**
 * @desc Aggiorna un utente
 * @route PUT /api/user
 * @access Private
 */
export const updateUser = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.description = 'Endpoint per aggiornare un utente.' 
    */
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Access denied.' });
    }
    const updateFields = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        phone: req.body.phone,
        paymentInfo: req.body.paymentInfo,
        address: req.body.address,
        preferences: req.body.preferences
    };

    if (req.body.password && req.body.password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true }).select('-password');

    if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

   
    const userObj = updatedUser.toObject();
    if (userObj.paymentInfo?.cardNumb) {
        userObj.paymentInfo.cardNumb = '****' + userObj.paymentInfo.cardNumb.slice(-4);
        delete userObj.paymentInfo.CVC;
    }

    res.status(200).json({ success: true, message: "User updated successfully", user: userObj });
});

/**
 * @desc  Elimina un utente
 * @route DELETE /api/user
 * @access Private
 */
export const deleteUser = asyncHandler(async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.description = 'Endpoint per eliminare un utente.' 
    */
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Access denied.' });
    }
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
    /*  #swagger.tags = ['Users']
        #swagger.description = 'Endpoint per aggiornare la password di un utente.' 
    */
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Access denied.' });
    }
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

    res.status(200).json({ message: 'Password successfully updated.' });
});
