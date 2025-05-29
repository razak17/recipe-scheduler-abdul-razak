import { useEffect, useState } from 'react';
import {
	createEvent as createEventApi,
	deleteEvent as deleteEventApi,
	getEventById as getEventByIdApi,
	getEvents as getEventsApi,
	RecipeEvent,
	updateEvent as updateEventApi
} from '../services/api';
import { schedulePushNotification } from '../services/notifications';

export const useRecipeEvent = (id: string) => {
	const [event, setEvent] = useState<RecipeEvent | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const loadEvent = async (id: string) => {
		try {
			setLoading(true);
			const response = await getEventByIdApi(id);
			setEvent(response);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to load event'));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (event) {
			console.log('Event updated:', event);
		}
	}, [event]);

	useEffect(() => {
		loadEvent(id);
	}, [id]);

	return { event, loading, error, loadEvent };
};

export const useRecipeEvents = () => {
	const [events, setEvents] = useState<RecipeEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [hasMore, setHasMore] = useState(true);

	const loadEvents = async (limit: number = 10, page: number = 1) => {
		try {
			setLoading(true);
			const response = await getEventsApi(limit, page);
			setEvents((prev) => (page === 1 ? response.data : [...prev, ...response.data]));
			setHasMore(response.pagination?.hasMore ?? false);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to load events'));
			setHasMore(false);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		console.log('Events updated:', events);
	}, [events]);

	useEffect(() => {
		loadEvents();
	}, []);

	const createEvent = async (event: Omit<RecipeEvent, 'id' | 'createdAt' | 'userId'>) => {
		const tempId = Date.now().toString(); // Temporary ID for optimistic update

		try {
			const optimisticEvent = {
				...event,
				id: tempId,
				createdAt: new Date().toISOString()
			};

			setEvents((prev) => [...prev, optimisticEvent]);

			const newEvent = await createEventApi({ ...event });

			// Replace optimistic update with real data
			setEvents((prev) => prev.map((e) => (e.id === tempId ? newEvent : e)));

			await scheduleReminder(newEvent);
			return newEvent;
		} catch (err) {
			// Rollback on error
			setEvents((prev) => prev.filter((e) => e.id !== tempId));
			throw err instanceof Error ? err : new Error('Failed to create event');
		}
	};

	const updateEvent = async (id: string, updates: Partial<RecipeEvent>) => {
		try {
			const updatedEvent = await updateEventApi(id, updates);
			setEvents((prev) => prev.map((e) => (e.id === id ? updatedEvent : e)));
			await scheduleReminder(updatedEvent);
			return updatedEvent;
		} catch (err) {
			throw err instanceof Error ? err : new Error('Failed to update event');
		}
	};

	const deleteEvent = async (id: string) => {
		try {
			await deleteEventApi(id);
			setEvents((prev) => prev.filter((e) => e.id !== id));
		} catch (err) {
			throw err instanceof Error ? err : new Error('Failed to delete event');
		}
	};

	const scheduleReminder = async (event: RecipeEvent) => {
		const reminderTime = new Date(event.eventTime);
		reminderTime.setMinutes(reminderTime.getMinutes() - 15);

		const now = new Date();
		if (reminderTime <= now) {
			console.warn('Event time is too soon to schedule reminder');
			return;
		}

		try {
			await schedulePushNotification(
				`Reminderfor ${event.title}`,
				`${event.title} at ${new Date(event.eventTime).toLocaleString()}`,
				reminderTime,
				event.id
			);
		} catch (error) {
			console.error('Failed to schedule reminder:', error);
		}
	};

	const refetch = () => {
		loadEvents(10, 1);
	};

	return {
		events,
		loading,
		error,
		hasMore,
		createEvent,
		updateEvent,
		deleteEvent,
		loadEvents,
		refetch
	};
};
