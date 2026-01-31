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
  allergies: [{
    type: String,
    trim: true
  }],
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  }
}, {
  timestamps: true,
});

const Meal = mongoose.model('Meal', MealSchema);

export default Meal;
