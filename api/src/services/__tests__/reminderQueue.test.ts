import { closeQueue, scheduleReminder } from '../reminderQueue';

jest.mock('bullmq', () => {
	const mockAdd = jest.fn();
	const mockRemove = jest.fn();
	const mockClose = jest.fn().mockResolvedValue(undefined);
	const mockGetJobs = jest.fn();

	const MockQueue = jest.fn().mockImplementation(() => {
		return {
			add: mockAdd,
			close: mockClose,
			getJobs: mockGetJobs,
			on: jest.fn()
		};
	});

	return {
		Queue: MockQueue,
		mockAdd,
		mockClose,
		mockGetJobs,
		mockRemove
	};
});

const originalConsole = { ...console };
beforeEach(() => {
	console.error = jest.fn();
	console.log = jest.fn();
	console.warn = jest.fn();
	jest.clearAllMocks();
});

afterAll(() => {
	console.error = originalConsole.error;
	console.log = originalConsole.log;
	console.warn = originalConsole.warn;
});

const NOW = 1625097600000; // 2021-07-01T00:00:00Z
const mockNow = jest.spyOn(Date, 'now').mockImplementation(() => NOW);

describe('Reminder Queue Service', () => {
	describe('scheduleReminder', () => {
		const mockEvent = {
			eventId: 'event-123',
			userId: 'user-456',
			title: 'Test Event',
			eventTime: new Date(NOW + 3600000) // 1 hour in the future
		};

		const { mockGetJobs, mockAdd } = require('bullmq');

		it('should schedule a reminder with correct parameters', async () => {
			mockGetJobs.mockResolvedValue([]);

			await scheduleReminder(
				mockEvent.eventId,
				mockEvent.userId,
				mockEvent.title,
				mockEvent.eventTime,
				30 // 30 minutes before
			);

			expect(mockAdd).toHaveBeenCalledWith(
				'send-reminder',
				{
					eventId: mockEvent.eventId,
					userId: mockEvent.userId,
					title: mockEvent.title,
					eventTime: mockEvent.eventTime.toISOString()
				},
				{
					delay: 1800000, // 30 minutes before event = 1800000ms
					jobId: mockEvent.eventId
				}
			);
		});

		it('should throw error if required parameters are missing', async () => {
			await expect(
				scheduleReminder('', mockEvent.userId, mockEvent.title, mockEvent.eventTime, 30)
			).rejects.toThrow('Missing required parameters for scheduling reminder');

			await expect(
				scheduleReminder(mockEvent.eventId, '', mockEvent.title, mockEvent.eventTime, 30)
			).rejects.toThrow('Missing required parameters for scheduling reminder');

			await expect(
				scheduleReminder(mockEvent.eventId, mockEvent.userId, '', mockEvent.eventTime, 30)
			).rejects.toThrow('Missing required parameters for scheduling reminder');

			await expect(
				scheduleReminder(mockEvent.eventId, mockEvent.userId, mockEvent.title, null as any, 30)
			).rejects.toThrow('Missing required parameters for scheduling reminder');
		});

		it('should remove existing jobs for the same event', async () => {
			const mockJob = {
				data: { eventId: mockEvent.eventId },
				remove: jest.fn().mockResolvedValue(undefined)
			};

			mockGetJobs.mockResolvedValue([mockJob]);

			await scheduleReminder(
				mockEvent.eventId,
				mockEvent.userId,
				mockEvent.title,
				mockEvent.eventTime,
				30
			);

			expect(mockJob.remove).toHaveBeenCalled();
			expect(mockAdd).toHaveBeenCalled();
		});

		it('should continue scheduling if removing existing jobs fails', async () => {
			const mockJob = {
				data: { eventId: mockEvent.eventId },
				remove: jest.fn().mockRejectedValue(new Error('Failed to remove job'))
			};

			mockGetJobs.mockResolvedValue([mockJob]);

			await scheduleReminder(
				mockEvent.eventId,
				mockEvent.userId,
				mockEvent.title,
				mockEvent.eventTime,
				30
			);

			expect(console.warn).toHaveBeenCalled();
			expect(mockAdd).toHaveBeenCalled();
		});

		it('should use 0 delay if reminder time is in the past', async () => {
			mockGetJobs.mockResolvedValue([]);

			// Event is 10 minutes in the future, but reminder is 30 minutes before
			const nearFutureEvent = new Date(NOW + 600000); // 10 minutes ahead

			await scheduleReminder(
				mockEvent.eventId,
				mockEvent.userId,
				mockEvent.title,
				nearFutureEvent,
				30
			);

			expect(mockAdd).toHaveBeenCalledWith(
				'send-reminder',
				expect.any(Object),
				expect.objectContaining({
					delay: 0 // Should be 0 since the reminder time is already past
				})
			);
		});

		it('should log error if scheduling fails', async () => {
			mockGetJobs.mockResolvedValue([]);
			mockAdd.mockRejectedValue(new Error('Queue error'));

			await expect(
				scheduleReminder(mockEvent.eventId, mockEvent.userId, mockEvent.title, mockEvent.eventTime, 30)
			).rejects.toThrow('Reminder scheduling failed: Queue error');

			expect(console.error).toHaveBeenCalled();
		});
	});

	describe('closeQueue', () => {
		const { mockClose } = require('bullmq');

		it('should close the queue successfully', async () => {
			mockClose.mockResolvedValue(undefined);

			await closeQueue();

			expect(mockClose).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalledWith('Reminder queue closed successfully');
		});

		it('should handle errors when closing the queue', async () => {
			mockClose.mockRejectedValue(new Error('Failed to close queue'));

			await closeQueue();

			expect(mockClose).toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith('Error closing reminder queue:', expect.any(Error));
		});
	});
});
