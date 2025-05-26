import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

const logDir = process.env.LOG_DIR || 'logs';
const isProduction = process.env.NODE_ENV === 'production';

const logFormat = combine(
	errors({ stack: true }),
	timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
	json(),
	printf((info) => {
		const { timestamp, level, message, ...meta } = info;
		return JSON.stringify({
			'@timestamp': timestamp,
			level,
			message,
			...meta
		});
	})
);

const fileRotateTransport = new winston.transports.DailyRotateFile({
	filename: path.join(logDir, 'application-%DATE%.log'),
	datePattern: 'YYYY-MM-DD',
	maxSize: '20m',
	maxFiles: '14d',
	zippedArchive: true
});

const consoleTransport = new winston.transports.Console({
	format: combine(
		colorize({ all: true }),
		printf((info) => {
			const { timestamp, level, message, stack, ...meta } = info;
			return `${timestamp} ${level}: ${message}${
				Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ''
			}${stack ? `\n${stack}` : ''}`;
		})
	)
});

const transports = isProduction ? [fileRotateTransport] : [consoleTransport, fileRotateTransport];

// Create the logger
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
	format: logFormat,
	defaultMeta: { service: 'api-service' },
	transports
});

export const logInfo = (message: string, meta = {}) => {
	logger.info(message, meta);
};

export const logError = (message: string, error: Error | unknown, meta = {}) => {
	if (error instanceof Error) {
		logger.error(message, { ...meta, error: error.message, stack: error.stack });
	} else {
		logger.error(message, { ...meta, error });
	}
};

export const logWarn = (message: string, meta = {}) => {
	logger.warn(message, meta);
};

export const logDebug = (message: string, meta = {}) => {
	logger.debug(message, meta);
};

export default logger;
