import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
	try {
		if (!Device.isDevice) {
			console.log('Push notifications not supported on simulators');
			return null;
		}

		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.HIGH,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C'
			});
		}

		const projectId = Constants.expoConfig?.extra?.eas?.projectId;
		if (!projectId) {
			console.warn('Project ID not found in app config - using fallback');
			throw new Error('Notification configuration incomplete');
		}

		let { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== 'granted') {
			console.log('Requesting notification permissions...');
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== 'granted') {
			console.log('Notification permission denied');
			return null;
		}

		console.log('Getting push token...');
		const tokenData = await Notifications.getExpoPushTokenAsync({
			projectId
		});

		if (!tokenData.data) {
			throw new Error('Failed to get push token');
		}

		return tokenData.data;
	} catch (error) {
		console.error('Push notification setup error:', error);
		return null;
	}
}
