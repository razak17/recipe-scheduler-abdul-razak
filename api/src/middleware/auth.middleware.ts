import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errorHandler';
import { logError, logInfo } from '../services/logger.service';
import { dataSource } from '../config/database';
import { User } from '../../../shared/src/modules/user/user.entity';

declare global {
	namespace Express {
		interface Request {
			userId?: string;
			user?: User;
		}
	}
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_this_in_production';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new ApiError(401, 'Unauthorized - Missing or invalid token format');
		}

		const token = authHeader.split(' ')[1];

		if (!token) {
			throw new ApiError(401, 'Unauthorized - No token provided');
		}

		try {
			const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
			req.userId = decoded.userId;

			const userRepository = dataSource.getRepository(User);
			const user = await userRepository.findOne({ where: { id: decoded.userId } });

			if (!user) {
				throw new ApiError(401, 'User not found');
			}

			req.user = user;

			logInfo('User authenticated', { userId: user.id });
			next();
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			} else if (error.name === 'TokenExpiredError') {
				logError('Token expired', error);
				throw new ApiError(401, 'Unauthorized - Token expired');
			} else if (error.name === 'JsonWebTokenError') {
				logError('Invalid token', error);
				throw new ApiError(401, 'Unauthorized - Invalid token');
			} else {
				logError('Token verification failed', error);
				throw new ApiError(401, 'Unauthorized - Invalid token');
			}
		}
	} catch (error) {
		next(error);
	}
};
