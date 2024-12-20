import express from 'express'
import { registerUser } from '../handlers';

const router = express.Router();

router.post('/register', registerUser);

export default router