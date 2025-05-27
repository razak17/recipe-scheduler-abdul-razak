import { appDataSource, Device, ReminderJob } from '../../shared/src';
import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

dotenv.config();

const expo = new Expo();

const connection = {
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379')
};

async function initializeDataSource() {
	try {
		await appDataSource.initialize();
		console.log('Data Source has been initialized!');
	} catch (err) {
		console.error('Error during Data Source initialization', err);
		throw err;
	}
}

async function sendPushNotification(userId: string, title: string, eventTime: string) {
	try {
		const deviceRepository = appDataSource.getRepository(Device);
		const device = await deviceRepository.findOne({ where: { userId } });

		if (!device || !device.pushToken) {
			console.log(`No push token found for user ${userId}`);
			return;
		}

		if (!Expo.isExpoPushToken(device.pushToken)) {
			console.error(`Push token ${device.pushToken} is not a valid Expo push token`);
			return;
		}

		const formattedTime = new Date(eventTime).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});

		const message: ExpoPushMessage = {
			to: device.pushToken,
			sound: 'default',
			title: 'Cooking Event Reminder',
			// body: `Your event "${title}" is coming up!`,
			body: `${title} at ${formattedTime}`,
			data: { title, eventTime }
		};

		// Log the notification payload for debugging
		console.log('Sending notification:', message);

		const chunks = expo.chunkPushNotifications([message]);
		const tickets: ExpoPushTicket[] = [];

		for (const chunk of chunks) {
			try {
				const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
				tickets.push(...ticketChunk);
				console.log('Push notification sent:', ticketChunk);
			} catch (error) {
				console.error('Error sending push notification:', error);
			}
		}

		// Handle any errors
		for (const ticket of tickets) {
			if (ticket.status === 'error') {
				console.error(`Error sending push notification: ${ticket.message}`);
			}
		}
	} catch (error) {
		console.error('Failed to send notification:', error);
	}
}

async function startWorker() {
	try {
		await initializeDataSource();

		const worker = new Worker(
			'reminders',
			async (job) => {
				const { id, userId, title, eventTime } = job.data as ReminderJob;
				console.log(`Processing reminder for event ${id}`);

				await sendPushNotification(userId, title, eventTime);

				console.log(`Reminder sent for event ${id}`);
			},
			{ connection }
		);

		console.log('Reminder worker started and listening for jobs...');

		worker.on('completed', (job) => {
			console.log(`Job ${job.id} completed`);
		});

		worker.on('failed', (job, err) => {
			console.error(`Job ${job?.id} failed with error ${err.message}`);
		});
	} catch (error) {
		console.error('Worker failed to start:', error);
		process.exit(1);
	}
}

startWorker();
