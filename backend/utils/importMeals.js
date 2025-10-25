import connectDB from '../config/database.js'
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Meal from '../models/Meal.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); 

connectDB();

const importData = async () => {
  try {
    const dataPath = path.resolve(__dirname, '../data/meals.json'); 
    const mealsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); 

    const meals = mealsData.map(meal => {
        const { _id, ...restOfMeal } = meal;
        return {
            ...restOfMeal
        };
    });

    await Meal.deleteMany();
    await Meal.insertMany(meals);
    console.log('Data successful imported!');
    process.exit();
  } catch (error) {
    console.error('Error during data importation:', error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Meal.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch(error) {
    console.error('Error during data elimination:', error);
    process.exit(1);
  }
}

if (process.argv[2] === '-i') {
  (async () => {
    await connectDB();
    await importData();
  })();
} else if (process.argv[2] === '-d') {
  (async () => {
    await connectDB();
    await deleteData();
  })();
} else {
  console.log('Please use -i to import data or -d to delete data.');
}
