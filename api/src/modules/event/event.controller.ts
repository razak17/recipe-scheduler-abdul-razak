import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { appDataSource, Event } from '../../../../shared/src';
import {
	CreateEventBody,
	DeleteEventParams,
	GetEventParams,
	UpdateEventBody,
	UpdateEventParams
} from './event.schema';
import { ApiError, asyncHandler } from '../../middleware/errorHandler';
// import { scheduleReminder } from '../../services/reminderQueue';

export interface GetEventParamsWithPagination extends GetEventParams {
	page?: string;
	limit?: string;
}

dotenv.config();
const DEFAULT_REMINDER_MINUTES = parseInt(process.env.REMINDER_LEAD_MINUTES || '15');

export const createEvent = asyncHandler(
	async (
		req: Request<Record<string, unknown>, Record<string, unknown>, CreateEventBody>,
		res: Response
	) => {
		const { title, eventTime, reminderMinutesBefore } = req.body;
		const userId = req.query.userId as string;

		if (!userId) {
			throw new ApiError(400, 'userId is required');
		}

		const eventRepository = appDataSource.getRepository(Event);
		const event = eventRepository.create({
			title,
			eventTime: new Date(eventTime),
			userId,
			reminderMinutesBefore: reminderMinutesBefore || DEFAULT_REMINDER_MINUTES
		});

		await eventRepository.save(event);

		// Schedule reminder
		// await scheduleReminder(
		// 	event.id,
		// 	event.userId,
		// 	event.title,
		// 	event.eventTime,
		// 	event.reminderMinutesBefore
		// );

		return res.status(201).json(event);
	}
);

export const getEvents = asyncHandler(
	async (
		req: Request<GetEventParamsWithPagination, Record<string, unknown>, Record<string, unknown>>,
		res: Response
	) => {
		const userId = req.query.userId as string;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const skip = (page - 1) * limit;

		if (!userId) {
			throw new ApiError(400, 'userId is required');
		}

		const eventRepository = appDataSource.getRepository(Event);

		const [events, total] = await eventRepository.findAndCount({
			where: { userId },
			order: { eventTime: 'ASC' },
			skip,
			take: limit
		});

		return res.json({
			events,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit)
			}
		});
	}
);

export const updateEvent = asyncHandler(
	async (
		req: Request<UpdateEventParams, Record<string, unknown>, UpdateEventBody>,
		res: Response
	) => {
		const { id } = req.params;
		const updateData = req.body;

		const eventRepository = appDataSource.getRepository(Event);
		const event = await eventRepository.findOne({ where: { id } });

		if (!event) {
			throw new ApiError(404, 'Event not found');
		}

		if (updateData.eventTime) {
			updateData.eventTime = new Date(updateData.eventTime).toISOString();
		}

		await eventRepository.update(id, updateData);
		const updatedEvent = await eventRepository.findOne({ where: { id } });

		if (updatedEvent && (updateData.eventTime || updateData.reminderMinutesBefore !== undefined)) {
			// Reschedule reminder if time or reminder minutes changed
			// await scheduleReminder(
			// 	updatedEvent.id,
			// 	updatedEvent.userId,
			// 	updatedEvent.title,
			// 	updatedEvent.eventTime,
			// 	updatedEvent.reminderMinutesBefore
			// );
		}

		return res.json(updatedEvent);
	}
);

export const deleteEvent = asyncHandler(
	async (
		req: Request<DeleteEventParams, Record<string, unknown>, Record<string, unknown>>,
		res: Response
	) => {
		const { id } = req.params;
		const eventRepository = appDataSource.getRepository(Event);

		const event = await eventRepository.findOne({ where: { id } });
		if (!event) {
			throw new ApiError(404, 'Event not found');
		}

		await eventRepository.delete(id);
		return res.status(204).send();
	}
);
