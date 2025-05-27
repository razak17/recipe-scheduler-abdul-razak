import { Redis } from 'ioredis';
import { getConfig } from '../config';

const config = getConfig();

let redisConnection: Redis;

if (config.nodeEnv === 'test' || config.nodeEnv === 'development') {
	redisConnection = new Redis({
		host: 'localhost',
		port: 6379,
		lazyConnect: true,
		enableOfflineQueue: false
	});

	redisConnection.on('error', () => {});
} else {
	redisConnection = new Redis(config.redisUrl, {
		maxRetriesPerRequest: null,
		enableReadyCheck: false
	});
}

redisConnection.on('connect', () => {
	if (config.nodeEnv !== 'test') {
		console.log('Connected to Redis');
	}
});

redisConnection.on('error', (err) => {
	if (config.nodeEnv !== 'test') {
		console.error('Redis connection error:', err);
	}
});

export { redisConnection };
