import { Job } from 'bullmq';
import { Expo } from 'expo-server-sdk';
import { dataSource } from '../config/databse';
import { ReminderJob } from '../../../shared/src/types';
import { notificationWorker } from '../services/notification.service';

jest.mock('expo-server-sdk');
jest.mock('../config/databse', () => ({
	dataSource: {
		getRepository: jest.fn()
	}
}));

describe('notificationWorker', () => {
	// Mock setup
	const mockFindOne = jest.fn();
	const mockSendPushNotificationsAsync = jest.fn().mockResolvedValue([{ status: 'ok' }]);
	const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

	const testJobData: ReminderJob = {
		id: '123',
		userId: 'user-123',
		title: 'Test Event',
		eventTime: '2023-10-15T14:30:00.000Z'
	};

	const mockJob = {
		data: testJobData
	} as Job;

	beforeEach(() => {
		jest.clearAllMocks();

		(dataSource.getRepository as jest.Mock).mockReturnValue({
			findOne: mockFindOne
		});

		const mockExpoInstance = new Expo();
		mockExpoInstance.sendPushNotificationsAsync = mockSendPushNotificationsAsync;

		(Expo.isExpoPushToken as unknown as jest.Mock) = jest.fn().mockReturnValue(false); // default value
	});

	it('should send push notification for valid Expo push tokens', async () => {
		const validExpoToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
		mockFindOne.mockResolvedValue({ userId: 'user-123', pushToken: validExpoToken });

		(Expo.isExpoPushToken as unknown as jest.Mock).mockReturnValue(true);

		await expect(notificationWorker(mockJob)).resolves.not.toThrow();
		expect(mockConsoleLog).toHaveBeenCalledWith('Reminder sent for event 123');
	});

	it('should return early if no device is found', async () => {
		mockFindOne.mockResolvedValue(null);

		await notificationWorker(mockJob);

		expect(mockFindOne).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
		expect(mockConsoleLog).toHaveBeenCalledWith('No push token found for user user-123');
		expect(mockSendPushNotificationsAsync).not.toHaveBeenCalled();
	});

	it('should return early if device has no push token', async () => {
		mockFindOne.mockResolvedValue({ userId: 'user-123', pushToken: null });

		await notificationWorker(mockJob);

		expect(mockConsoleLog).toHaveBeenCalledWith('No push token found for user user-123');
		expect(mockSendPushNotificationsAsync).not.toHaveBeenCalled();
	});

	it('should log mock notification for non-Expo push tokens', async () => {
		mockFindOne.mockResolvedValue({ userId: 'user-123', pushToken: 'not-an-expo-token' });
		(Expo.isExpoPushToken as unknown as jest.Mock) = jest.fn().mockReturnValue(false);

		const formattedTime = new Date(testJobData.eventTime).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});

		await notificationWorker(mockJob);

		expect(mockConsoleLog).toHaveBeenCalledWith('Mock Notification:', {
			to: 'not-an-expo-token',
			title: `Reminder for Test Event`,
			body: `Test Event at ${formattedTime}`,
			data: { title: 'Test Event', eventTime: testJobData.eventTime }
		});
		expect(mockSendPushNotificationsAsync).not.toHaveBeenCalled();
	});
});
