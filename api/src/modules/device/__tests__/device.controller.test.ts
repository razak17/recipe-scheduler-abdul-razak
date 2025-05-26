import { Request, Response } from 'express';
import { registerDevice } from '../device.controller';
import { dataSource } from '../../../config/database';

jest.mock('../../../services/logger.service', () => ({
	logInfo: jest.fn(),
	logError: jest.fn()
}));

describe('Device Controller', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let deviceRepositoryMock: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockRequest = {
			body: {},
			userId: 'test_user_id'
		};

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};

		deviceRepositoryMock = {
			findOne: jest.fn(),
			create: jest.fn(),
			save: jest.fn()
		};

		jest.spyOn(dataSource, 'getRepository').mockReturnValue(deviceRepositoryMock);
	});

	describe('registerDevice', () => {
		it('should register a new device if none exists', async () => {
			mockRequest.body = {
				pushToken: 'device_push_token'
			};

			deviceRepositoryMock.findOne.mockResolvedValue(null);

			const mockDevice = {
				id: 'device_id',
				userId: 'test_user_id',
				pushToken: 'device_push_token'
			};

			deviceRepositoryMock.create.mockReturnValue(mockDevice);

			await registerDevice(mockRequest as Request, mockResponse as Response);

			expect(deviceRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId: 'test_user_id' } });
			expect(deviceRepositoryMock.create).toHaveBeenCalledWith({
				userId: 'test_user_id',
				pushToken: 'device_push_token'
			});
			expect(deviceRepositoryMock.save).toHaveBeenCalledWith(mockDevice);
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith(mockDevice);
		});

		it('should update an existing device', async () => {
			mockRequest.body = {
				pushToken: 'new_push_token'
			};

			const existingDevice = {
				id: 'device_id',
				userId: 'test_user_id',
				pushToken: 'old_push_token'
			};

			deviceRepositoryMock.findOne.mockResolvedValue(existingDevice);

			await registerDevice(mockRequest as Request, mockResponse as Response);

			expect(deviceRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId: 'test_user_id' } });
			expect(deviceRepositoryMock.create).not.toHaveBeenCalled();
			expect(deviceRepositoryMock.save).toHaveBeenCalledWith({
				id: 'device_id',
				userId: 'test_user_id',
				pushToken: 'new_push_token'
			});
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				id: 'device_id',
				userId: 'test_user_id',
				pushToken: 'new_push_token'
			});
		});

		it('should return 401 if userId is missing', async () => {
			mockRequest.body = {
				pushToken: 'device_push_token'
			};
			mockRequest.userId = undefined;

			const result = await registerDevice(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
		});
	});
});
