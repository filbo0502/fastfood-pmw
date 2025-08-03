import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Restaurant from "./Restaurant.js";
import { nameRegex, surnameRegex,emailRegex,passwordRegex } from "../utils/regex.js";

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        match: nameRegex
    },
    surname:{
        type: String,
        required: true,
        match: surnameRegex
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match: emailRegex
    },
    password:{
        type: String,
        required: true,
        match: passwordRegex,
        minLength: 8,
        maxLength: 128
    },
    userType:{
        type: String,
        enum: ['customer', 'restaurateur'],
        required: true
    },
    paymentInfo:{
        cardType: String,
        cardNumb: String,
        expiryDate: Date
    },
    address:{
        street: String,
        city: String,
        zipCode: String,
    },
    preferences:{
        favouriteCategories: [String],
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
},{
    timestamps: true
});

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre('findOneAndDelete', async function(next){
    try{
        const user = await this.model.findOne(this.getQuery());
        if(user && user.userType === 'restaurateur'){
            await Restaurant.deleteMany({ owner: user._id });
        }
        next();
    }catch(error){
        next(error);
    }
});

const User = mongoose.model('User', UserSchema);
export default User;