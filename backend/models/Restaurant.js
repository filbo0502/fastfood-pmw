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
    image:{
        type: String,
        required: false,
        default: null
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
        meal:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Meal',
            required: true
        },
        price:{
            type: Number,
            required: true,
            min: [0, 'Price could not be negative.']
        },
        preparationTime:{
            type: Number,
            required: true,
            min: [0, 'Preparation time could not be negative.']
        },
        isAvailable:{
            type: Boolean,
            default: true
        }
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
export default Restaurant;