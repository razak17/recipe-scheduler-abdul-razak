import { appDataSource, Device, testDataSource } from '../../../shared/src';

export const dataSource = process.env.NODE_ENV === 'test' ? testDataSource : appDataSource;

export async function connectDB(skipDbInit: boolean = false) {
	try {
		if (!skipDbInit && !dataSource.isInitialized) {
			await dataSource.initialize();
		}
		console.log(`Data Source has been initialized in ${process.env.NODE_ENV}!`);
	} catch (error) {
		console.error(`Error during Data Source initialization in ${process.env.ENV}!`, error);
		throw error;
	}
}

export async function getDeviceToken(userId: string): Promise<string | null> {
	const repo = dataSource.getRepository(Device);
	const device = await repo.findOne({ where: { userId } });
	return device ? device.pushToken : null;
}
