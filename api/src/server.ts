import dotenv from 'dotenv';
import app from "./app";
import { connectDB } from './config/database';

const PORT = process.env.PORT || 8000;

dotenv.config();

const startServer = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV}`);
		});
	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
};

startServer();
