import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { connectDB } from './config/databse';
import { notificationWorker } from './services/notification.service';
import { redisConnection } from './services/redis.service';

dotenv.config();

async function startWorker() {
	try {
		await connectDB();

		const worker = new Worker('reminders', notificationWorker, {
			connection: redisConnection,
			removeOnComplete: { count: 1000 },
			removeOnFail: { count: 5000 }
		});

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
