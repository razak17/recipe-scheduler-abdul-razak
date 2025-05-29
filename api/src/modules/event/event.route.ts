import { Router } from 'express';
import {
	createEventHandler,
	deleteEventHandler,
	getEventByIdHandler,
	getEventsHandler,
	updateEventHandler
} from './event.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use('/events', authenticate);

router.post('/events', createEventHandler);
router.get('/events', getEventsHandler);
router.get('/events/:id', getEventByIdHandler);
router.patch('/events/:id', updateEventHandler);
router.delete('/events/:id', deleteEventHandler);

export default router;
