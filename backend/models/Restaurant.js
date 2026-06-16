import mongoose from "mongoose";
import fs from 'fs/promises';
import path from 'path';

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    vatNumber: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false,
        default: null
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    menu: [{
        meal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Meal',
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price could not be negative.']
        },
        preparationTime: {
            type: Number,
            required: true,
            min: [0, 'Preparation time could not be negative.']
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    }]
});

RestaurantSchema.pre('findOneAndDelete', async function (next) {
    try {
        const restaurant = await this.model.findOne(this.getQuery());
        if (restaurant) {
            if (restaurant.image && restaurant.image.startsWith('/uploads/')) {
                const imagePath = path.join(process.cwd(), restaurant.image);
                try {
                    await fs.unlink(imagePath);
                    console.log(`Deleted restaurant image: ${imagePath}`);
                } catch (err) {
                    console.error(`Failed to delete restaurant image: ${imagePath}`, err);
                }
            }
            const { default: Meal } = await import('./Meal.js');
            const meals = await Meal.find({ createdBy: restaurant._id });
            for (const meal of meals) {
                await Meal.findByIdAndDelete(meal._id);
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
export default Restaurant;