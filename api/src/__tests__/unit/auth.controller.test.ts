import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as authController from '../../modules/auth/auth.controller';
import { loginUser } from '../../modules/auth/auth.controller';
import { dataSource } from '../../config/database';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../services/logger.service', () => ({
	logInfo: jest.fn(),
	logError: jest.fn()
}));

jest.mock('../../utils/errorHandler', () => {
	const original = jest.requireActual('../../utils/errorHandler');
	return {
		...original,
		asyncHandler: (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
			try {
				return await fn(req, res, next);
			} catch (error) {
				next(error);
			}
		}
	};
});

jest.mock('../../config/database', () => ({
	dataSource: {
		getRepository: jest.fn()
	}
}));

describe('Auth Controller', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let userRepositoryMock: any;
	let nextFunction: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		mockRequest = {
			body: {}
		};

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};

		nextFunction = jest.fn();

		userRepositoryMock = {
			findOne: jest.fn(),
			create: jest.fn(),
			save: jest.fn()
		};

		(dataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

		(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		(jwt.sign as jest.Mock).mockReturnValue('mock_token');
	});

	describe('registerUser', () => {
		it('should register a new user successfully', async () => {
			mockRequest.body = {
				email: 'test@example.com',
				password: 'password123',
				name: 'Test User'
			};

			userRepositoryMock.findOne.mockResolvedValue(null);

			const mockUser = {
				id: 'user_id',
				email: 'test@example.com',
				name: 'Test User',
				password: 'hashed_password'
			};

			userRepositoryMock.create.mockReturnValue(mockUser);
			userRepositoryMock.save.mockResolvedValue(mockUser);

			await authController.registerUser(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
				where: { email: 'test@example.com' }
			});
			expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
			expect(userRepositoryMock.create).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'hashed_password',
				name: 'Test User'
			});
			expect(userRepositoryMock.save).toHaveBeenCalled();
			expect(jwt.sign).toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				user: {
					id: 'user_id',
					email: 'test@example.com',
					name: 'Test User'
				},
				token: 'mock_token'
			});
			expect(nextFunction).not.toHaveBeenCalled();
		});

		it('should return 409 if email already exists', async () => {
			mockRequest.body = {
				email: 'existing@example.com',
				password: 'password123',
				name: 'Test User'
			};

			userRepositoryMock.findOne.mockResolvedValue({
				id: 'existing_id',
				email: 'existing@example.com'
			});

			await authController.registerUser(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
				where: { email: 'existing@example.com' }
			});
			expect(nextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 409,
					message: 'Email already in use'
				})
			);
			expect(userRepositoryMock.create).not.toHaveBeenCalled();
			expect(userRepositoryMock.save).not.toHaveBeenCalled();
		});
	});

	describe('loginUser', () => {
		it('should login a user successfully', async () => {
			mockRequest.body = {
				email: 'test@example.com',
				password: 'password123'
			};

			userRepositoryMock.findOne.mockResolvedValue({
				id: 'user_id',
				email: 'test@example.com',
				password: 'hashed_password'
			});

			await loginUser(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
				where: { email: 'test@example.com' }
			});
			expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
			expect(jwt.sign).toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				user: {
					id: 'user_id',
					email: 'test@example.com'
				},
				token: 'mock_token'
			});
		});

		it('should return 401 if user not found', async () => {
			mockRequest.body = {
				email: 'nonexistent@example.com',
				password: 'password123'
			};

			userRepositoryMock.findOne.mockResolvedValue(null);

			await loginUser(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(nextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
					message: 'Invalid credentials'
				})
			);
		});

		it('should return 401 if password is incorrect', async () => {
			mockRequest.body = {
				email: 'test@example.com',
				password: 'wrong_password'
			};

			userRepositoryMock.findOne.mockResolvedValue({
				id: 'user_id',
				email: 'test@example.com',
				password: 'hashed_password'
			});

			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await loginUser(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(nextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
					message: 'Invalid credentials'
				})
			);
		});
	});
});
