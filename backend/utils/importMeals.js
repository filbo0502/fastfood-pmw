import fs from "fs";
import path from "path"; 
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Meal from "../models/Meal.js"
import connectDB from "../config/database.js"
import dotenv from 'dotenv'

dotenv.config();

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const mealsPath = path.join(__dirname, '..', 'data', 'meals.json');
const meals = JSON.parse(fs.readFileSync(mealsPath, 'utf-8'));

const importData = async () => {
    try{
        const preparedMeals = meals.map(meal => ({
        ...meal,
        isCommon: true
        }));
        await Meal.create(preparedMeals);
        console.log('Data imported...');
        process.exit();
    }catch(e){
        console.error(e);
        process.exit(1);
    }
}

const deleteData = async () => {
    try{
        await Meal.deleteMany({ isCommon: true });
        console.log('Common meals deleted...');
        process.exit();
    }catch(e){
        console.error(e);
        process.exit(1);
    }
}

if(process.argv[2] === '-i'){
    importData();
} else if(process.argv[2] === '-d'){
    deleteData();
} else {
  console.log('Please use -i to import or -d to delete common meals');
  process.exit();
}