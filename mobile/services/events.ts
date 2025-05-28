import { useState, useEffect } from 'react';
import {
	getEvents as getEventsApi,
	createEvent as createEventApi,
	updateEvent as updateEventApi,
	deleteEvent as deleteEventApi,
	RecipeEvent
} from './api';
import { schedulePushNotification } from './notifications';

export const useEvents = () => {
	const [events, setEvents] = useState<RecipeEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const loadEvents = async () => {
		try {
			setLoading(true);
			const events = await getEventsApi();
			setEvents(events);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to load events'));
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

	const createEvent = async (event: Omit<RecipeEvent, 'id' | 'createdAt'>) => {
		// Declare tempId outside the try-catch block
		const tempId = Date.now().toString(); // Temporary ID for optimistic update

		try {
			const optimisticEvent = {
				...event,
				id: tempId,
				createdAt: new Date().toISOString()
			};

			setEvents((prev) => [...prev, optimisticEvent]);

			// Actual API call
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

		await schedulePushNotification(
			`Reminder: ${event.title}`,
			`Starts at ${new Date(event.eventTime).toLocaleString()}`,
			reminderTime
		);
	};

	const refetch = () => {
		loadEvents();
	};

	return {
		events,
		loading,
		error,
		createEvent,
		updateEvent,
		deleteEvent,
		refetch
	};
};
