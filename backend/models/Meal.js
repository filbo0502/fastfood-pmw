import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

const MealSchema = new mongoose.Schema({
  idMeal: {
    type: String,
    required: true,
    unique: true,
  },
  strMeal: {
    type: String,
    required: [true, 'Meal name is mandatory.'],
    trim: true,
  },
  strCategory: {
    type: String,
    trim: true,
  },
  strArea: {
    type: String,
    trim: true,
  },
  strMealThumb: {
    type: String,
    trim: true,
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  price: {
    type: Number,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

MealSchema.pre('findOneAndDelete', async function(next) {
    try {
        const meal = await this.model.findOne(this.getQuery());
        if (meal && meal.isCustom && meal.strMealThumb) {
            // Controlla se è un file locale in /uploads
            if (meal.strMealThumb.startsWith('/uploads/')) {
                 const imagePath = path.join(process.cwd(), meal.strMealThumb);
                 try {
                     await fs.unlink(imagePath);
                     console.log(`Deleted meal image: ${imagePath}`);
                 } catch (err) {
                     console.error(`Failed to delete meal image: ${imagePath}`, err);
                 }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Meal = mongoose.model('Meal', MealSchema);

export default Meal;
