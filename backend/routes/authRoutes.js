import express from 'express';
import { body } from 'express-validator';
import { login, logout, register, upload } from '../controllers/authController.js';

const router = express.Router();

const registrationValidationRules = [
    body('name', 'Name must be provided.').not().isEmpty(),
    body('surname', 'Name must be provided.').not().isEmpty(),
    body('email', 'Please, insert a valid email address.').isEmail(),
    body('password', 'Password must be long at least 8 characters.').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => {
        if(value !== req.body.password){
            throw new Error('Password not match!')
        }
        return true;
    }),
    body('userType', 'You must select a user type.').isIn(['customer', 'restaurateur']),
    body('restaurantName', 'Restaurant name must be provided for restaurateurs.').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('vatNumber', 'Restaurant must a Vat Number.').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('phone', 'Restaurant name must have a phone number.').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('addressStreet', 'Restaurant must have a valid address street.').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('addressCity', 'Restaurant must have a valid address city.').if(body('userType').equals('restaurateur')).not().isEmpty(),
    body('addressZip', 'Restaurant must have a valid address zip.').if(body('userType').equals('restaurateur')).not().isEmpty()
]

router.post('/login', login);

router.post('/register', upload.single('restaurantImage'), registrationValidationRules, register);

router.post('/logout', logout);

export default router;