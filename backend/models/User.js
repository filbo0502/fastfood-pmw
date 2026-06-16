import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Restaurant from "./Restaurant.js";
import { nameRegex, surnameRegex, emailRegex, passwordRegex } from "../utils/regex.js";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: nameRegex
    },
    surname: {
        type: String,
        required: true,
        match: surnameRegex
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: emailRegex
    },
    phone: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        enum: ['customer', 'restaurateur'],
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    paymentInfo: {
        cardType: String,
        cardNumb: String,
        CVC: Number,
        expiryDate: Date
    },
    address: {
        street: String,
        city: String,
        zipCode: String,
    },
    preferences: {
        wantsSpecialOffers: {
            type: Boolean,
            default: false
        },
        favoriteCategory: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

// Hash della password prima di salvare nel database
// Esegue l'hash solo se la password è stata modificata
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Quando un ristoratore viene eliminato, elimina anche il suo ristorante
UserSchema.pre('findOneAndDelete', async function (next) {
    try {
        const user = await this.model.findOne(this.getQuery());
        if (user && user.userType === 'restaurateur') {
            const restaurants = await Restaurant.find({ owner: user._id });
            for (const rest of restaurants) {
                await Restaurant.findByIdAndDelete(rest._id);
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', UserSchema);
export default User;