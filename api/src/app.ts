import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { appDataSource } from './data-source';
import eventRoutes from './modules/event/entity.route';
import deviceRoutes from './modules/device/device.route';

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
	res.status(200).json({ status: 'ok' });
});

app.use('/api', eventRoutes);
app.use('/api', deviceRoutes);

export const initializeApp = async () => {
	try {
		appDataSource
			.initialize()
			.then(() => {
				console.log('Data Source has been initialized!');
			})
			.catch((err) => {
				console.error('Error during Data Source initialization', err);
			});

		return app;
	} catch (error) {
		console.error('Error connecting to database:', error);
		throw error;
	}
};

export default app;
