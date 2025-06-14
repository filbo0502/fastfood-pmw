import mongoose from 'mongoose';

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
  strMealAlternate: {
    type: String,
    default: null,
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
  strCreativeCommonsConfirmed: {
    type: String, 
    default: null,
  },
  dateModified: {
    type: Date,
    default: null,
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price could not be negative'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Meal = mongoose.model('Meal', MealSchema);

export default Meal;
