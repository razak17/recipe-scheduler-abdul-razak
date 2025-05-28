import { Job } from 'bullmq';
import { Expo } from 'expo-server-sdk';
import { dataSource } from '../config/databse';
import { Device } from '../../../shared/src/modules/device/device.entity';
import { ReminderJob } from '../../../shared/src/types';

const expo = new Expo();

export const notificationWorker = async (job: Job) => {
	const event = job.data as ReminderJob;

	try {
		const deviceRepo = dataSource.getRepository(Device);
		const device = await deviceRepo.findOne({ where: { userId: event.userId } });

		if (!device || !device.pushToken) {
			console.log(`No push token found for user ${event.userId}`);
			return;
		}

		const formattedTime = new Date(event.eventTime).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});

		// Log notifications when testing
		if (!Expo.isExpoPushToken(device.pushToken)) {
			console.log('Mock Notification:', {
				to: device.pushToken,
				title: `Reminder for ${event.title}`,
				body: `${event.title} at ${formattedTime}`,
				data: { title: event.title, eventTime: event.eventTime }
			});
			return;
		}

		await expo.sendPushNotificationsAsync([
			{
				to: device.pushToken,
				sound: 'default',
				title: `Reminder for ${event.title}`,
				body: `${event.title} at ${formattedTime}`,
				data: { title: event.title, eventTime: event.eventTime }
			}
		]);

		console.log(`Reminder sent for event ${event.id}`);
	} catch (error) {
		console.error('Error sending notification:', error);
		throw error;
	}
};
