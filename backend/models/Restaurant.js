import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    description:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    vatNumber:{
        type: String,
        required: true
    },
    address:{
        street:{
            type: String,
            required: true
        },
        city:{
            type: String,
            required: true
        },
        zipCode:{
            type: String,
            required: true
        },
        coordinates:{
            langitude: Number,
            longitude: Number
        }
    },
    menu:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Meal'
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
export default Restaurant;