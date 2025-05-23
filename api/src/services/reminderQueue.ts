import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { ReminderJob } from '../../../shared/src';

dotenv.config();

// Initialize Redis connection
const connection = {
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379')
};

// Create reminder queue
export const reminderQueue = new Queue('reminders', {
	connection,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 1000
		},
		removeOnComplete: true,
		removeOnFail: 5000
	}
});

// Add error handling for the queue
reminderQueue.on('error', (error) => {
	console.error('Reminder queue error:', error);
});

export const scheduleReminder = async (
	eventId: string,
	userId: string,
	title: string,
	eventTime: Date,
	reminderMinutesBefore: number
): Promise<void> => {
	try {
		if (!eventId || !userId || !title || !eventTime) {
			throw new Error('Missing required parameters for scheduling reminder');
		}

		const reminderTime = new Date(eventTime.getTime() - reminderMinutesBefore * 60 * 1000);

		// Delete any existing jobs for this event
		try {
			const existingJobs = await reminderQueue.getJobs();
			for (const job of existingJobs) {
				const data = await job.data;
				if (data && data.eventId === eventId) {
					await job.remove();
					console.log(`Removed existing reminder job for event: ${eventId}`);
				}
			}
		} catch (error) {
			console.warn(`Failed to clean up existing jobs for event ${eventId}:`, error);
			// Continue with scheduling the new job anyway
		}

		// Schedule the new job
		const jobData: ReminderJob = {
			eventId,
			userId,
			title,
			eventTime: eventTime.toISOString()
		};

		const delay = Math.max(0, reminderTime.getTime() - Date.now());

		await reminderQueue.add('send-reminder', jobData, {
			delay,
			jobId: eventId
		});

		console.log(`Reminder scheduled for ${reminderTime.toISOString()}, delay: ${delay}ms`);
	} catch (error) {
		console.error(`Failed to schedule reminder for event ${eventId}:`, error);
		throw new Error(
			`Reminder scheduling failed: ${error instanceof Error ? error.message : String(error)}`
		);
	}
};

// Add a graceful shutdown function
export const closeQueue = async (): Promise<void> => {
	try {
		await reminderQueue.close();
		console.log('Reminder queue closed successfully');
	} catch (error) {
		console.error('Error closing reminder queue:', error);
	}
};
