import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getUser, updateUser, deleteUser, updatePassword, updateUserPreferences, getUserPreferences } from '../controllers/userController.js';

const router = express.Router();

router.get('/:id', authMiddleware, getUser);

router.put('/:id', authMiddleware, updateUser);

router.put('/:id/password', authMiddleware, updatePassword);

router.put('/:id/preferences', authMiddleware, updateUserPreferences);

router.get('/:id/preferences', authMiddleware, getUserPreferences);

router.delete('/:id', authMiddleware, deleteUser);

export default router;