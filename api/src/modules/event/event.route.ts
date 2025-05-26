import { Router } from 'express';
import { createEvent, deleteEvent, getEvents, updateEvent } from './event.controller';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.use('/events', authenticate);

router.post('/events', createEvent);
router.get('/events', getEvents);
router.patch('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;
