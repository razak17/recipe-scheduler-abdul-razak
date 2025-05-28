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

export async function schedulePushNotification(title: string, body: string, triggerDate: Date) {
	try {
		await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				sound: 'default'
			},
			trigger: {
				type: 'date',
				date: triggerDate
			} as Notifications.NotificationTriggerInput
		});
	} catch (error) {
		console.error('Failed to schedule notification:', error);
	}
}
