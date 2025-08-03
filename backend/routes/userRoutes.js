import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getUser, updateUser, deleteUser, updatePassword } from '../controllers/userController.js';

const router = express.Router();

router.get('/:id', authMiddleware, getUser);

router.put('/:id', authMiddleware, updateUser);

router.put('/:id/password', authMiddleware, updatePassword);

router.delete('/:id', authMiddleware, deleteUser);

export default router;