import express from 'express';
import { login, logout, register, upload } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);

router.post('/register', upload.single('restaurantImage'), register);

router.delete('/logout', logout);

export default router;