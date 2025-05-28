import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError, asyncHandler } from '../../utils/errorHandler';
import { logError, logInfo } from '../../services/logger.service';
import { CreateEventBody, UpdateEventBody } from './event.schema';
import {
	createEvent,
	deleteEvent,
	getEventById,
	getEventsByUserId,
	updateEvent
} from './event.service';

export const createEventHandler = asyncHandler(
	async (
		req: Request<Record<string, unknown>, Record<string, unknown>, CreateEventBody>,
		res: Response
	) => {
		try {
			const userId = req.userId;

			if (!userId) {
				logError('Missing userId in createEvent request', null, { body: req.body });
				throw new ApiError(400, 'userId is required');
			}

			const { title, eventTime, reminderMinutesBefore } = req.body;

			const newEvent = {
				title,
				eventTime,
				reminderMinutesBefore,
				userId
			};

			logInfo('Creating event', newEvent);

			const event = await createEvent(newEvent);

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

export const getEventsHandler = asyncHandler(
	async (
		req: Request<
			{
				page?: string;
				limit?: string;
			},
			Record<string, unknown>,
			Record<string, unknown>
		>,
		res: Response
	) => {
		try {
			const userId = req.userId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const skip = (page - 1) * limit;

			if (!userId) {
				logError('Missing userId in getEvents request', null, { query: req.query });
				throw new ApiError(400, 'userId is required');
			}

			const params = {
				userId,
				page,
				limit,
				skip
			};

			logInfo('Fetching events', params);

			const events = await getEventsByUserId(params);

			logInfo('Events fetched successfully', {
				userId,
				count: events.items.length,
				total: events.total,
				page
			});

			return res.json({
				events,
				pagination: {
					total: events.total,
					page,
					limit,
					pages: Math.ceil(events.total / limit)
				}
			});
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			logError('Failed to fetch events', error, {
				query: req.query
			});
			throw new ApiError(500, 'Failed to fetch events');
		}
	}
);

export const updateEventHandler = asyncHandler(
	async (
		req: Request<Record<string, string>, Record<string, unknown>, UpdateEventBody>,
		res: Response
	) => {
		try {
			const { id } = req.params;
			const updateData = req.body;
			const userId = req.userId;

			logInfo('Updating event', {
				eventId: id,
				userId,
				updateData
			});

			const event = await getEventById(id);

			if (!event) {
				logError('Event not found for update', null, {
					eventId: id,
					userId,
					updateData
				});
				return res.status(404).json({ error: 'Event not found' });
			}

			if (event.userId !== userId) {
				logError('Unauthorized event update attempt', null, {
					eventId: id,
					eventUserId: event.userId,
					requestUserId: userId
				});
				return res.status(403).json({ error: 'Unauthorized to update this event' });
			}

			if (updateData.eventTime) {
				updateData.eventTime = new Date(updateData.eventTime).toISOString();
			}

			const updatedEvent = await updateEvent(id, updateData);

			if (updatedEvent && (updateData.eventTime || updateData.reminderMinutesBefore !== undefined)) {
				logInfo('Event updated with new time or reminder settings', {
					eventId: id,
					newEventTime: updateData.eventTime,
					newReminderMinutes: updateData.reminderMinutesBefore
				});
			}

			logInfo('Event updated successfully', { eventId: id, userId });

			return res.status(200).json(updatedEvent);
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

export const deleteEventHandler = asyncHandler(
	async (
		req: Request<Record<string, string>, Record<string, unknown>, Record<string, unknown>>,
		res: Response
	) => {
		try {
			const { id } = req.params;
			const userId = req.userId;

			logInfo('Deleting event', { eventId: id, userId });

			const event = await getEventById(id);
			if (!event) {
				logError('Event not found for deletion', null, { eventId: id, userId });
				return res.status(404).json({ error: 'Event not found' });
			}

			if (event.userId !== userId) {
				logError('Unauthorized event deletion attempt', null, {
					eventId: id,
					eventUserId: event.userId,
					requestUserId: userId
				});
				return res.status(403).json({ error: 'Unauthorized to delete this event' });
			}

			await deleteEvent(id);

			logInfo('Event deleted successfully', { eventId: id, userId });

			return res.status(200).json({ message: 'Event deleted successfully' });
		} catch (error) {
			if (error instanceof ApiError) {
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
