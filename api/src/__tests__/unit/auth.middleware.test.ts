import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dataSource } from '../../config/database';
import { authenticate } from '../../middleware/auth.middleware';

jest.mock('jsonwebtoken');
jest.mock('../../services/logger.service', () => ({
	logInfo: jest.fn(),
	logError: jest.fn()
}));

jest.mock('../../config/database', () => ({
	dataSource: {
		getRepository: jest.fn()
	}
}));

describe('Auth Middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: jest.Mock;
	let userRepositoryMock: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockRequest = {
			headers: {}
		};

		mockResponse = {};
		nextFunction = jest.fn();

		userRepositoryMock = {
			findOne: jest.fn()
		};

		jest.spyOn(dataSource, 'getRepository').mockReturnValue(userRepositoryMock);
	});

	describe('authenticate', () => {
		it('should authenticate a valid token', async () => {
			mockRequest.headers = {
				authorization: 'Bearer valid_token'
			};

			const decodedToken = { userId: 'user_id' };
			(jwt.verify as jest.Mock).mockReturnValue(decodedToken);

			const mockUser = { id: 'user_id', email: 'test@example.com', role: 'user' };
			userRepositoryMock.findOne.mockResolvedValue(mockUser);

			await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(jwt.verify).toHaveBeenCalledWith('valid_token', expect.any(String));
			expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'user_id' } });
			expect(mockRequest.userId).toBe('user_id');
			expect(mockRequest.user).toEqual(mockUser);
			expect(nextFunction).toHaveBeenCalled();
			expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
		});

		it('should reject if authorization header is missing', async () => {
			mockRequest.headers = {};

			await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(nextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
					message: expect.stringContaining('Unauthorized')
				})
			);
		});

		it('should reject if token is invalid', async () => {
			mockRequest.headers = {
				authorization: 'Bearer invalid_token'
			};

			(jwt.verify as jest.Mock).mockImplementation(() => {
				throw new Error('JsonWebTokenError');
			});

			await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(nextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
					message: expect.stringContaining('Invalid token')
				})
			);
		});

		it('should reject if user not found', async () => {
			mockRequest.headers = {
				authorization: 'Bearer valid_token'
			};

			const decodedToken = { userId: 'nonexistent_id' };
			(jwt.verify as jest.Mock).mockReturnValue(decodedToken);

			userRepositoryMock.findOne.mockResolvedValue(null);

			await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(nextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
					message: expect.stringContaining('User not found')
				})
			);
		});
	});
});
