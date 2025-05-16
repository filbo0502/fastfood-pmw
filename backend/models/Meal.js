import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    ingredients:[{
        type: String,
        isAllergen: true,
        required: true
    }],
    category:{
        type: String,
        required: true
    },
    imageUrl:{
        type: String
    },
    price:{
        type: Number,
        required: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Meal = mongoose.model('Meal', MealSchema);
export default Meal;