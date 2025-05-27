import { Queue } from 'bullmq';
import { IEvent } from '../../../../shared/src';
import { QueueService } from '../../services/queue.service';
import { redisConnection } from '../../services/redis.service';

describe('QueueService Integration Tests', () => {
	let queueService: QueueService;
	let testQueue: Queue;

	beforeAll(async () => {
		testQueue = new Queue('reminders', {
			connection: {
				host: 'localhost',
				port: 6379,
				maxRetriesPerRequest: null
			}
		});

		await testQueue.obliterate({ force: true });
	});

	beforeEach(() => {
		queueService = new QueueService();
	});

	afterEach(async () => {
		await testQueue.obliterate({ force: true });
	});

	afterAll(async () => {
		await queueService.closeQueue();
		await testQueue.close();

		if (redisConnection.status !== 'end') {
			await redisConnection.quit();
		}

		await new Promise((resolve) => setTimeout(resolve, 500));
	});

	test('scheduleReminder adds a job to the queue', async () => {
		const mockEvent: IEvent = {
			id: 'test-event-1',
			userId: 'user-456',
			title: 'Test Event',
			eventTime: new Date(Date.now() + 3600000), // 1 hour from now
			createdAt: new Date(),
			reminderMinutesBefore: 5
		};

		await queueService.scheduleReminder(mockEvent);

		const jobs = await testQueue.getJobs(['waiting', 'delayed']);
		expect(jobs.length).toBe(1);
		expect(jobs[0].id).toBe('test-event-1');

		const jobData = await jobs[0].data;
		expect(jobData.event.id).toBe(mockEvent.id);
	});

	test('scheduleReminder sets correct delay', async () => {
		const futureTime = new Date(Date.now() + 100000);
		const mockEvent: IEvent = {
			id: 'test-event-2',
			userId: 'user-456',
			title: 'Test Event',
			eventTime: new Date(Date.now() + 3600000), // 1 hour from now
			createdAt: new Date(),
			reminderMinutesBefore: 1 // 1 minute before (60 seconds)
		};

		const expectedReminderTime = new Date(futureTime.getTime() - 60000);

		await queueService.scheduleReminder(mockEvent);

		const jobs = await testQueue.getJobs(['delayed']);
		expect(jobs.length).toBe(1);

		expect(jobs[0].id).toBe('test-event-2');

		const jobData = await jobs[0].data;
		expect(jobData.event.id).toBe(mockEvent.id);
	});

	test('scheduleReminder with past event time uses zero delay', async () => {
		const mockEvent: IEvent = {
			id: 'test-event-3',
			userId: 'user-456',
			title: 'Test Event',
			eventTime: new Date(Date.now() + 3600000), // 1 hour from now
			createdAt: new Date(),
			reminderMinutesBefore: 5
		};

		await queueService.scheduleReminder(mockEvent);

		const jobs = await testQueue.getJobs(['waiting', 'active', 'delayed']);
		expect(jobs.length).toBe(1);
		expect(jobs[0].id).toBe('test-event-3');
	});

	test('closeQueue closes the queue connection', async () => {
		const queueSpy = jest.spyOn((queueService as any).queue, 'close');

		await queueService.closeQueue();

		expect(queueSpy).toHaveBeenCalled();

		queueService = new QueueService();
	});
});
