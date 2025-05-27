import dotenv from 'dotenv';
import { dataSource } from '../config/database';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
	if (!dataSource.isInitialized) {
		await dataSource.initialize();
	}

	const entities = dataSource.entityMetadatas;
	for (const entity of entities) {
		const repository = dataSource.getRepository(entity.name);
		await repository.clear();
	}
});

afterAll(async () => {
	if (dataSource.isInitialized) {
		await dataSource.destroy();
	}
});
