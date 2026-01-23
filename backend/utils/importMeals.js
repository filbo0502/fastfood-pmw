import connectDB from '../config/database.js'
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Meal from '../models/Meal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const importData = async () => {
  try {
    const dataPath = path.resolve(__dirname, '../data/meals.json');
    if (!fs.existsSync(dataPath)) {
      console.log('Data file not found.');
      return;
    }

    const mealsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const meals = mealsData.map(meal => {
      const { _id, ...restOfMeal } = meal;
      return { ...restOfMeal };
    });

    await Meal.insertMany(meals);
    console.log('Data successfully imported!');
  } catch (error) {
    console.error('Error during data importation:', error);
    throw error;
  }
};

export const deleteData = async () => {
  try {
    await Meal.deleteMany();
    console.log('Data successfully deleted!');
  } catch (error) {
    console.error('Error during data elimination:', error);
    throw error;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

  if (process.argv[2] === '-i') {
    (async () => {
      await connectDB();
      await Meal.deleteMany();
      await importData();
      process.exit();
    })();
  } else if (process.argv[2] === '-d') {
    (async () => {
      await connectDB();
      await deleteData();
      process.exit();
    })();
  } else {
    console.log('Please use -i to import data or -d to delete data.');
    process.exit();
  }
}
