import { QueueService } from '../../services/queue.service';
import { Event } from '../../../../shared/src';
import { dataSource } from '../../config/database';
import { getDeviceToken } from '../device/device.service';
import { CreateEventBody, UpdateEventBody } from './event.schema';

export async function createEvent(event: CreateEventBody): Promise<Event> {
	if (!event.userId) {
		throw new Error('userId is required to create an event');
	}

	const repo = dataSource.getRepository(Event);
	const newEvent = repo.create(event);
	await repo.save(newEvent);

	const pushToken = await getDeviceToken(event.userId);
	if (pushToken) {
		const queueService = new QueueService();
		await queueService.scheduleReminder(newEvent);
	}

	return newEvent;
}

export async function getEventsByUserId({
	userId,
	page = 1,
	limit = 10,
	skip = (page - 1) * limit
}: {
	userId: string;
	page: number;
	limit: number;
	skip?: number;
}): Promise<{ items: Event[]; total: number }> {
	const repo = dataSource.getRepository(Event);
	const [events, total] = await repo.findAndCount({
		where: { userId },
		order: { eventTime: 'ASC' },
		skip,
		take: limit
	});
	return { items: events, total };
}

export async function getEventById(id: string): Promise<Event | null> {
	const repo = dataSource.getRepository(Event);
	return repo.findOne({ where: { id } });
}

export async function updateEvent(id: string, eventData: UpdateEventBody): Promise<Event | null> {
	const repo = dataSource.getRepository(Event);
	await repo.update(id, eventData);
	const updatedEvent = await repo.findOne({ where: { id } });

	if (updatedEvent) {
		const pushToken = await getDeviceToken(updatedEvent.userId);
		if (pushToken) {
			const queueService = new QueueService();
			await queueService.scheduleReminder(updatedEvent);
		}
	}

	return updatedEvent;
}

export async function deleteEvent(id: string): Promise<void> {
	const repo = dataSource.getRepository(Event);
	await repo.delete(id);
}
