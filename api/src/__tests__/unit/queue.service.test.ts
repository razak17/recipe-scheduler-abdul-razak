import { QueueService } from '../../services/queue.service';
import { Queue } from 'bullmq';

// Mock the BullMQ module
jest.mock('bullmq', () => {
	const mockAddFn = jest.fn().mockResolvedValue(undefined);
	const mockCloseFn = jest.fn().mockResolvedValue(undefined);

	return {
		Queue: jest.fn().mockImplementation(() => ({
			add: mockAddFn,
			close: mockCloseFn
		}))
	};
});

describe('QueueService', () => {
	let queueService: QueueService;
	let mockQueue: any;

	beforeEach(() => {
		jest.clearAllMocks();

		queueService = new QueueService();

		const MockQueue = Queue as jest.MockedClass<typeof Queue>;

		mockQueue = MockQueue.mock.results[0].value;
	});

	it('should add a job to the queue with correct parameters for future event', async () => {
		const mockEvent = {
			id: 'event-123',
			userId: 'user-456',
			title: 'Test Event',
			eventTime: new Date(Date.now() + 3600000), // 1 hour from now
			createdAt: new Date(),
			reminderMinutesBefore: 15
		};

		await queueService.scheduleReminder(mockEvent);

		expect(mockQueue.add).toHaveBeenCalledWith(
			`reminder:${mockEvent.id}`,
			{ event: mockEvent },
			expect.objectContaining({
				jobId: mockEvent.id,
				delay: expect.any(Number)
			})
		);
	});

	it('should not schedule if event time is in past', async () => {
		const pastEvent = {
			id: 'past-id',
			userId: 'user-1',
			title: 'Past Event',
			eventTime: new Date(Date.now() - 3600000), // 1 hour in the past
			createdAt: new Date(),
			reminderMinutesBefore: 15
		};

		await queueService.scheduleReminder(pastEvent);

		expect(mockQueue.add).toHaveBeenCalledWith(
			`reminder:${pastEvent.id}`,
			{ event: pastEvent },
			expect.objectContaining({
				delay: 0 // Should set delay to 0 for past events
			})
		);
	});

	it('should close queue properly', async () => {
		await queueService.closeQueue();
		expect(mockQueue.close).toHaveBeenCalled();
	});
});
