import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { registerDevice } from './api';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true
	})
});

export interface Notification {
	id: string;
	title: string;
	body: string;
	data: any;
	receivedAt: Date;
}

const notifications: Notification[] = [];

export const getNotifications = (): Notification[] => {
	return [...notifications];
};

export const registerForPushNotifications = async (userId: string): Promise<any> => {
	if (!Device.isDevice) {
		console.log('Push notifications not available on emulator');
		return;
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		console.log('Failed to get push token for push notification!');
		return;
	}

	try {
		const token = (await Notifications.getExpoPushTokenAsync()).data;

		// Register the device with our backend
		await registerDevice({ userId, pushToken: token });

		// On Android, we need to set notification channel
		if (Platform.OS === 'android') {
			Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C'
			});
		}

		// Add a listener for incoming notifications
		const subscription = Notifications.addNotificationReceivedListener((notification) => {
			const { title, body, data } = notification.request.content;

			notifications.unshift({
				id: notification.request.identifier,
				title: title || '',
				body: body || '',
				data,
				receivedAt: new Date()
			});
		});

		return () => {
			subscription.remove();
		};
	} catch (error) {
		console.error('Error registering for push notifications:', error);
	}
};
