import express from 'express'
import {body} from 'express-validator'
import { handleInputErrors } from '../middleware/validation';
import { getUser,updateUser, uploadUserImage, getUserByHandle } from '../handlers';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getUser);

router.patch('/', 
    body('handle')
    .isString().withMessage('Invalid handler')
    .notEmpty().withMessage('Handle cannot be empty'),

    body('description')
    .isLength({ min: 3, max: 60 }).withMessage('Description should have at least 3 characters'),
    handleInputErrors,
    authMiddleware, 
    updateUser
);

router.post('/image', authMiddleware, uploadUserImage);

router.get('/:handle', authMiddleware, getUserByHandle);

export default router