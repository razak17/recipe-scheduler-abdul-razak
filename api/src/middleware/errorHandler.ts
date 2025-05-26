import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logError } from '../services/logger.service';

export class ApiError extends Error {
	statusCode: number;

	constructor(statusCode: number, message: string) {
		super(message);
		this.statusCode = statusCode;
		this.name = 'ApiError';
	}
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(`Error: ${err.message}, Stack: ${err.stack}`);

	if (err instanceof ZodError) {
		return res.status(400).json({
			status: 'error',
			message: 'Validation error',
			errors: err.errors
		});
	}

	if (err instanceof ApiError) {
		return res.status(err.statusCode).json({
			status: 'error',
			message: err.message
		});
	}

	if (err.name === 'QueryFailedError') {
		return res.status(400).json({
			status: 'error',
			message: 'Database query error'
		});
	}

  logError('API Error', err, {
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id']
  });

	return res.status(500).json({
		status: 'error',
		message: 'Internal server error'
	});
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
