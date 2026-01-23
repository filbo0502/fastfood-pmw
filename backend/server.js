import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";

import Meal from './models/Meal.js';

import swaggerUI from 'swagger-ui-express';
import swaggerDOC from './swagger.json' with { type: 'json' }

import authRoutes from './routes/authRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js'
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';


dotenv.config();
const app = express();
connectDB();
app.use(cookieParser());
const PORT = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:)/, '$1');

app.use(express.static(path.resolve(__dirname, '../frontend'), { index: 'index.html' }));

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
});


app.use('/api/swagger', swaggerUI.serve, swaggerUI.setup(swaggerDOC));
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);

import { importData } from './utils/importMeals.js';

const checkAndImportData = async () => {
    try {
        const count = await Meal.countDocuments();
        if (count === 0) {
            console.log('DB empty, importing initial data...');
            await importData();
        }
    } catch (error) {
        console.error('Error checking/importing data:', error);
    }
};

app.listen(PORT, async () => {
    await checkAndImportData();
    console.log(`Server is running on port ${PORT}`)
})