import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";

import swaggerUI from 'swagger-ui-express';
import swaggerDOC from './swagger.json' with { type:'json' }

import authRoutes from './routes/authRoutes.js';


dotenv.config();
const app = express();
connectDB();
app.use(cookieParser());
const PORT = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uso import.meta.url per ottenere il percorso della cartella
const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:)/, '$1');
// Percorso relativo per la cartella frontend

app.use(express.static(path.resolve(__dirname, '../frontend'), { index: 'index.html' }));
// Rende il file index.html

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get("/", (req,res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/api/swagger', swaggerUI.serve, swaggerUI.setup(swaggerDOC));
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})