import { Router } from 'express';
import {
	registerUser,
	loginUser,
	getCurrentUser,
	forgotPassword,
	resetPassword,
	refreshToken
} from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/me', authenticate, getCurrentUser);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/refresh-token', refreshToken);

export default router;
