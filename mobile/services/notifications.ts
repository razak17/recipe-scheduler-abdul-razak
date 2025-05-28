import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotifications';
import * as Notifications from 'expo-notifications';
import { registerDevice } from './api';

export async function registerForPushNotifications() {
	try {
		const token = await registerForPushNotificationsAsync();
		if (token) {
			console.log('Registering device token with backend...');
			await registerDevice(token);
			console.log('Push token registered successfully');
		}
		return token;
	} catch (error) {
		console.error('Failed to register token with backend:', error);
	}
}

export async function schedulePushNotification(
	title: string,
	body: string,
	triggerDate: Date,
	eventId?: string
): Promise<string> {
	try {
		const now = new Date();
		const minFutureTime = new Date(now.getTime() + 60 * 1000);

		if (triggerDate <= minFutureTime) {
			console.warn('Cannot schedule notification for past or immediate future time');
			return '';
		}

		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				sound: 'default',
				data: {
					url: eventId ? `/events/${eventId}` : '/events'
				}
			},
			trigger: {
				type: 'date',
				date: triggerDate
			} as Notifications.NotificationTriggerInput
		});
		return notificationId;
	} catch (error) {
		console.error('Failed to schedule notification:', error);
		return '';
	}
}
