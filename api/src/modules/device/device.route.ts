import { Router } from 'express';
import { registerDevice } from './device.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/devices', authenticate, registerDevice);

export default router;
