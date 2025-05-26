import { dataSource } from '../../config/database';

export const clearTable = async (entityName: string): Promise<void> => {
	const repository = dataSource.getRepository(entityName);
	await repository.clear();
};

export const resetDatabase = async (): Promise<void> => {
	const entities = dataSource.entityMetadatas;
	for (const entity of entities) {
		const repository = dataSource.getRepository(entity.name);
		await repository.clear();
	}
};

export const initTestDatabase = async () => {
	try {
		await dataSource.initialize();
		console.log('Test database initialized');
		return dataSource;
	} catch (error) {
		console.error('Error initializing test database', error);
		throw error;
	}
};
