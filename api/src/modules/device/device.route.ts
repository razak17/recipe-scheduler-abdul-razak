import { Router } from 'express';
import { registerDevice } from './device.controller';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.post('/devices', authenticate, registerDevice);

export default router;
