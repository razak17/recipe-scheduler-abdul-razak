import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import eventRoutes from './modules/event/event.route';
import deviceRoutes from './modules/device/device.route';
import authRoutes from './modules/auth/auth.route';
import { errorHandler } from './utils/errorHandler';
import { checkDatabaseConnection } from './services/health.service';
import { errorLogger, requestLogger } from './middleware/logging.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(requestLogger as any);

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per window
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		status: 429,
		error: 'Too many requests, please try again later.'
	}
});

app.use('/api', apiLimiter);

app.get('/api/health', async (_, res) => {
	const dbStatus = await checkDatabaseConnection();

	const status = {
		service: 'ok',
		timestamp: new Date().toISOString(),
		database: dbStatus ? 'connected' : 'disconnected',
		uptime: process.uptime(),
		version: process.env.npm_package_version || 'unknown'
	};

	const statusCode = dbStatus ? 200 : 503;

	res.status(statusCode).json(status);
});

app.use('/api', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', deviceRoutes);

app.use(errorLogger as any);
app.use(errorHandler as any);

export default app;
