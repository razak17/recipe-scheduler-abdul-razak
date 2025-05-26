import { Request, Response } from 'express';
import { ZodError } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { appDataSource } from '../../../../shared/src';
import {
	RegisterUserBody,
	LoginUserBody,
	ForgotPasswordBody,
	RefreshTokenBody,
	ResetPasswordBody
} from './auth.schema';
import { ApiError, asyncHandler } from '../../middleware/errorHandler';
import { logInfo, logError } from '../../services/logger.service';
import { User } from '../../../../shared/src/modules/user/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_this_in_production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export const registerUser = asyncHandler(
	async (
		req: Request<Record<string, unknown>, Record<string, unknown>, RegisterUserBody>,
		res: Response
	) => {
		try {
			const { email, password, name } = req.body;

			logInfo('User registration attempt', { email });

			const userRepository = appDataSource.getRepository(User);

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			if (!emailRegex.test(email)) {
				logError('Invalid email format', null, { email });
				throw new ApiError(400, 'Invalid email format');
			}

			const existingUser = await userRepository.findOne({ where: { email } });
			if (existingUser) {
				logError('Registration failed - email already in use', null, { email });
				throw new ApiError(409, 'Email already in use');
			}

			const saltRounds = 10;
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			const user = userRepository.create({
				email,
				password: hashedPassword,
				name
			});

			await userRepository.save(user);

			const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

			logInfo('User registered successfully', { userId: user.id });

			const { password: _, ...userWithoutPassword } = user;
			return res.status(201).json({
				user: userWithoutPassword,
				token
			});
		} catch (error) {
			if (error instanceof ZodError) {
				logError('Validation error in user registration', error, {
					errors: error.errors
				});
				return res.status(400).json({ error: error.errors });
			}

			if (error instanceof ApiError) {
				throw error;
			}

			logError('Failed to register user', error, { email: req.body.email });
			throw new ApiError(500, 'Failed to register user');
		}
	}
);

export const loginUser = asyncHandler(
	async (
		req: Request<Record<string, unknown>, Record<string, unknown>, LoginUserBody>,
		res: Response
	) => {
		try {
			const { email, password } = req.body;

			logInfo('User login attempt', { email });

			const userRepository = appDataSource.getRepository(User);

			const user = await userRepository.findOne({ where: { email } });
			if (!user) {
				logError('Login failed - invalid credentials', null, { email });
				throw new ApiError(401, 'Invalid credentials');
			}

			const passwordMatches = await bcrypt.compare(password, user.password);
			if (!passwordMatches) {
				logError('Login failed - invalid credentials', null, { email });
				throw new ApiError(401, 'Invalid credentials');
			}

			const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

			logInfo('User logged in successfully', { userId: user.id });

			const { password: _, ...userWithoutPassword } = user;
			return res.status(200).json({
				user: userWithoutPassword,
				token
			});
		} catch (error) {
			if (error instanceof ZodError) {
				logError('Validation error in user login', error, {
					errors: error.errors
				});
				return res.status(400).json({ error: error.errors });
			}

			if (error instanceof ApiError) {
				throw error;
			}

			logError('Failed to login user', error, { email: req.body.email });
			throw new ApiError(500, 'Failed to login user');
		}
	}
);

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
	try {
		const userId = req.userId;

		if (!userId) {
			throw new ApiError(401, 'Unauthorized');
		}

		const userRepository = appDataSource.getRepository(User);
		const user = await userRepository.findOne({ where: { id: userId } });

		if (!user) {
			throw new ApiError(404, 'User not found');
		}

		const { password, ...userWithoutPassword } = user;
		return res.status(200).json({ user: userWithoutPassword });
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}

		logError('Failed to get current user', error, { userId: req.userId });
		throw new ApiError(500, 'Failed to get current user');
	}
});

export const forgotPassword = asyncHandler(
	async (
		req: Request<Record<string, unknown>, Record<string, unknown>, ForgotPasswordBody>,
		res: Response
	) => {
		try {
			const { email } = req.body;

			logInfo('Password reset requested', { email });

			const userRepository = appDataSource.getRepository(User);
			const user = await userRepository.findOne({ where: { email } });

			if (!user) {
				return res.status(200).json({
					message: 'If your email is in our system, you will receive a reset link shortly'
				});
			}

			const resetToken = crypto.randomBytes(32).toString('hex');
			const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

			logInfo('Password reset token generated', {
				userId: user.id,
				resetToken,
				resetTokenExpiry
			});

			return res.status(200).json({
				message: 'If your email is in our system, you will receive a reset link shortly'
			});
		} catch (error) {
			logError('Failed to process password reset request', error, { email: req.body.email });
			throw new ApiError(500, 'Failed to process password reset request');
		}
	}
);

export const resetPassword = asyncHandler(
	async (
		req: Request<Record<string, unknown>, Record<string, unknown>, ResetPasswordBody>,
		res: Response
	) => {
		try {
			const { token, password } = req.body;

			logInfo('Password reset attempt', { token: token.substring(0, 10) + '...' });

			const userRepository = appDataSource.getRepository(User);
			const user = await userRepository.findOne({ where: { resetToken: token } });

			if (!user) {
				throw new ApiError(401, 'Invalid token');
			}

			const saltRounds = 10;
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			user.password = hashedPassword;
			user.resetToken = "";
			await userRepository.save(user);

			logInfo('Password reset successful', { token: token.substring(0, 10) + '...' });

			return res.status(200).json({ message: 'Password has been reset successfully' });
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}

			logError('Failed to reset password', error);
			throw new ApiError(500, 'Failed to reset password');
		}
	}
);

export const refreshToken = asyncHandler(
	async (
		req: Request<Record<string, unknown>, Record<string, unknown>, RefreshTokenBody>,
		res: Response
	) => {
		try {
			const { refreshToken } = req.body;

			if (!refreshToken) {
				throw new ApiError(400, 'Refresh token is required');
			}

			const userRepository = appDataSource.getRepository(User);
			const user = await userRepository.findOne({ where: { refreshToken } });

			if (!user) {
				throw new ApiError(401, 'Invalid refresh token');
			}

			// Generate new access token
			const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

			logInfo('Token refreshed successfully', { userId: user.id });

			return res.status(200).json({
				message: 'Token refresh endpoint (implementation required)',
				token,
				refreshToken: refreshToken
			});
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}

			logError('Failed to refresh token', error);
			throw new ApiError(500, 'Failed to refresh token');
		}
	}
);

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
	try {
		const userId = req.userId;

		if (!userId) {
			throw new ApiError(401, 'Unauthorized');
		}

		logInfo('User logout attempt', { userId });

		const userRepository = appDataSource.getRepository(User);
		await userRepository.update(userId, { refreshToken: "" });

		logInfo('User logged out successfully', { userId });

		return res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}

		logError('Failed to logout user', error, { userId: req.userId });
		throw new ApiError(500, 'Failed to logout user');
	}
});
