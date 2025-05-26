import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../services/logger.service';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const requestId = uuidv4();
	req.headers['x-request-id'] = requestId;

	const startTime = Date.now();

	logger.info('Incoming request', {
		requestId,
		method: req.method,
		url: req.originalUrl,
		ip: req.ip,
		userAgent: req.get('user-agent')
	});

	const originalSend = res.send;
	res.send = function (body) {
		res.locals.body = body;
		return originalSend.call(this, body);
	};

	res.on('finish', () => {
		const responseTime = Date.now() - startTime;

		const logMethod = res.statusCode >= 400 ? logger.warn : logger.info;
		logMethod('Request completed', {
			requestId,
			method: req.method,
			url: req.originalUrl,
			statusCode: res.statusCode,
			responseTime: `${responseTime}ms`,
			contentLength: res.get('Content-Length')
		});
	});

	next();
};

export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
	const requestId = req.headers['x-request-id'];

	logger.error('Request error', {
		requestId,
		method: req.method,
		url: req.originalUrl,
		error: err.message,
		stack: err.stack
	});

	next(err);
};
