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
import { logInfo, logError } from '../../services/logger.service';
import { ZodError } from 'zod';

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
		try {
			const { title, eventTime, reminderMinutesBefore } = req.body;
			const userId = req.query.userId as string;

			logInfo('Creating event', {
				title,
				eventTime,
				reminderMinutesBefore,
				userId
			});

			if (!userId) {
				logError('Missing userId in createEvent request', null, { body: req.body });
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

			logInfo('Event created successfully', { eventId: event.id, userId });

			return res.status(201).json(event);
		} catch (error) {
			if (error instanceof ZodError) {
				logError('Validation error in event creation', error, {
					errors: error.errors,
					body: req.body
				});
				return res.status(400).json({ error: error.errors });
			}

			if (error instanceof ApiError) {
				throw error;
			}

			logError('Failed to create event', error, {
				body: req.body,
				userId: req.query.userId
			});
			throw new ApiError(500, 'Failed to create event');
		}
	}
);

export const getEvents = asyncHandler(
	async (
		req: Request<GetEventParamsWithPagination, Record<string, unknown>, Record<string, unknown>>,
		res: Response
	) => {
		try {
			const userId = req.query.userId as string;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const skip = (page - 1) * limit;

			logInfo('Fetching events', {
				userId,
				page,
				limit
			});

			if (!userId) {
				logError('Missing userId in getEvents request', null, { query: req.query });
				throw new ApiError(400, 'userId is required');
			}

			const eventRepository = appDataSource.getRepository(Event);

			const [events, total] = await eventRepository.findAndCount({
				where: { userId },
				order: { eventTime: 'ASC' },
				skip,
				take: limit
			});

			logInfo('Events fetched successfully', {
				userId,
				count: events.length,
				total,
				page
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
		} catch (error) {
			if (error instanceof ApiError) {
				// Let asyncHandler handle this
				throw error;
			}

			logError('Failed to fetch events', error, {
				query: req.query
			});
			throw new ApiError(500, 'Failed to fetch events');
		}
	}
);

export const updateEvent = asyncHandler(
	async (
		req: Request<UpdateEventParams, Record<string, unknown>, UpdateEventBody>,
		res: Response
	) => {
		try {
			const { id } = req.params;
			const updateData = req.body;
			const userId = req.query.userId as string;

			logInfo('Updating event', {
				eventId: id,
				userId,
				updateData
			});

			const eventRepository = appDataSource.getRepository(Event);
			const event = await eventRepository.findOne({ where: { id } });

			if (!event) {
				logError('Event not found for update', null, {
					eventId: id,
					userId,
					updateData
				});
				throw new ApiError(404, 'Event not found');
			}

			if (event.userId !== userId) {
				logError('Unauthorized event update attempt', null, {
					eventId: id,
					eventUserId: event.userId,
					requestUserId: userId
				});
				throw new ApiError(403, 'Unauthorized to update this event');
			}

			if (updateData.eventTime) {
				updateData.eventTime = new Date(updateData.eventTime).toISOString();
			}

			await eventRepository.update(id, updateData);
			const updatedEvent = await eventRepository.findOne({ where: { id } });

			if (updatedEvent && (updateData.eventTime || updateData.reminderMinutesBefore !== undefined)) {
				logInfo('Event updated with new time or reminder settings', {
					eventId: id,
					newEventTime: updateData.eventTime,
					newReminderMinutes: updateData.reminderMinutesBefore
				});
			}

			logInfo('Event updated successfully', {
				eventId: id,
				userId
			});

			return res.json(updatedEvent);
		} catch (error) {
			if (error instanceof ZodError) {
				logError('Validation error in event update', error, {
					errors: error.errors,
					eventId: req.params.id,
					body: req.body
				});
				return res.status(400).json({ error: error.errors });
			}

			if (error instanceof ApiError) {
				// Let asyncHandler handle this
				throw error;
			}

			logError('Failed to update event', error, {
				eventId: req.params.id,
				body: req.body,
				userId: req.query.userId
			});
			throw new ApiError(500, 'Failed to update event');
		}
	}
);

export const deleteEvent = asyncHandler(
	async (
		req: Request<DeleteEventParams, Record<string, unknown>, Record<string, unknown>>,
		res: Response
	) => {
		try {
			const { id } = req.params;
			const userId = req.query.userId as string;

			logInfo('Deleting event', {
				eventId: id,
				userId
			});

			const eventRepository = appDataSource.getRepository(Event);

			const event = await eventRepository.findOne({ where: { id } });
			if (!event) {
				logError('Event not found for deletion', null, {
					eventId: id,
					userId
				});
				throw new ApiError(404, 'Event not found');
			}

			if (event.userId !== userId) {
				logError('Unauthorized event deletion attempt', null, {
					eventId: id,
					eventUserId: event.userId,
					requestUserId: userId
				});
				throw new ApiError(403, 'Unauthorized to delete this event');
			}

			await eventRepository.delete(id);

			logInfo('Event deleted successfully', {
				eventId: id,
				userId
			});

			return res.status(204).send();
		} catch (error) {
			if (error instanceof ApiError) {
				// Let asyncHandler handle this
				throw error;
			}

			logError('Failed to delete event', error, {
				eventId: req.params.id,
				userId: req.query.userId
			});
			throw new ApiError(500, 'Failed to delete event');
		}
	}
);
