import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logError } from '../services/logger.service';

export const validateRequest = (schema: AnyZodObject) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req.body);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				logError('Request validation error', error, {
					errors: error.errors,
					body: req.body
				});
				return res.status(400).json({ error: error.errors });
			}
			next(error);
		}
	};
};
