import { Request, Response } from 'express';
import { Event } from './event.entity';
import { ZodError } from 'zod';
import { appDataSource } from '../../data-source';
import {
	CreateEventBody,
	DeleteEventParams,
	GetEventParams,
	UpdateEventBody,
	UpdateEventParams
} from './event.schema';

export const createEvent = async (
	req: Request<Record<string, unknown>, Record<string, unknown>, CreateEventBody>,
	res: Response
): Promise<any> => {
	try {
		const { title, eventTime, reminderMinutesBefore } = req.body;
		const userId = req.query.userId as string;

		if (!userId) {
			return res.status(400).json({ error: 'userId is required' });
		}

		const eventRepository = appDataSource.getRepository(Event);
		const event = eventRepository.create({
			title,
			eventTime: new Date(eventTime),
			userId,
			reminderMinutesBefore: reminderMinutesBefore || 15
		});

		await eventRepository.save(event);
		return res.status(201).json(event);
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).json({ error: error.errors });
		}
		return res.status(500).json({ error: 'Failed to create event' });
	}
};

export const getEvents = async (
	req: Request<GetEventParams, Record<string, unknown>, Record<string, unknown>>,
	res: Response
): Promise<any> => {
	try {
		const userId = req.query.userId as string;

		if (!userId) {
			return res.status(400).json({ error: 'userId is required' });
		}

		const eventRepository = appDataSource.getRepository(Event);
		const events = await eventRepository.find({
			where: { userId },
			order: { eventTime: 'ASC' }
		});

		return res.json(events);
	} catch (error) {
		return res.status(500).json({ error: 'Failed to fetch events' });
	}
};

export const updateEvent = async (
	req: Request<UpdateEventParams, Record<string, unknown>, UpdateEventBody>,
	res: Response
): Promise<any> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const eventRepository = appDataSource.getRepository(Event);
		const event = await eventRepository.findOne({ where: { id } });

		if (!event) {
			return res.status(404).json({ error: 'Event not found' });
		}

		if (updateData.eventTime) {
			updateData.eventTime = new Date(updateData.eventTime).toISOString();
		}

		await eventRepository.update(id, updateData);

		const updatedEvent = await eventRepository.findOne({ where: { id } });
		return res.json(updatedEvent);
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).json({ error: error.errors });
		}
		return res.status(500).json({ error: 'Failed to update event' });
	}
};

export const deleteEvent = async (
	req: Request<DeleteEventParams, Record<string, unknown>, Record<string, unknown>>,
	res: Response
): Promise<any> => {
	try {
		const { id } = req.params;
		const eventRepository = appDataSource.getRepository(Event);

		const event = await eventRepository.findOne({ where: { id } });
		if (!event) {
			return res.status(404).json({ error: 'Event not found' });
		}

		await eventRepository.delete(id);
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ error: 'Failed to delete event' });
	}
};
