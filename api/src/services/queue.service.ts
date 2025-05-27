import { Queue } from 'bullmq';
import { redisConnection } from './redis.service';
import { IEvent } from '../../../shared/src';
import { logError, logInfo } from './logger.service';

export class QueueService {
	private queue: Queue;

	constructor(redisConn = redisConnection) {
		this.queue = new Queue('reminders', {
			connection: redisConn,
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 3000
				},
				removeOnComplete: true,
				removeOnFail: 5000
			}
		});
	}

	async scheduleReminder(event: IEvent): Promise<void> {
		const { id, eventTime, reminderMinutesBefore = 15 } = event;
		try {
			const reminderTime = new Date(eventTime.getTime() - reminderMinutesBefore);
			const delay = Math.max(0, reminderTime.getTime() - Date.now());

			await this.queue.add(
				`reminder:${id}`,
				{ event },
				{
					delay,
					jobId: id
				}
			);

			console.log(`Reminder scheduled for ${reminderTime.toISOString()}, delay: ${delay}ms`);
			logInfo(`Scheduled reminder for event ${id}`, event);
		} catch (error) {
			logError(`Failed to schedule reminder for event ${id}`, error, { eventId: id });
		}
	}

	async closeQueue(): Promise<void> {
		try {
			if (this.queue) {
				await this.queue.close();
				logInfo('Reminder queue closed successfully');
			}
			console.log('Reminder queue closed successfully');
		} catch (error) {
			console.error('Error closing reminder queue:', error);
			logError('Error closing reminder queue', error);
		}
	}
}
