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

export const scheduleReminder = async (
	eventId: string,
	userId: string,
	title: string,
	eventTime: Date,
	reminderMinutesBefore: number
) => {
	const reminderTime = new Date(eventTime.getTime() - reminderMinutesBefore * 60 * 1000);

	// Delete any existing jobs for this event
	const existingJobs = await reminderQueue.getJobs();
	for (const job of existingJobs) {
		const data = await job.data;
		if (data && data.eventId === eventId) {
			await job.remove();
		}
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
};
