import dotenv from 'dotenv';
import { appTestDataSource } from '../../../shared/src';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  if (!appTestDataSource.isInitialized) {
    await appTestDataSource.initialize();
  }

  const entities = appTestDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = appTestDataSource.getRepository(entity.name);
    await repository.clear();
  }
});

afterAll(async () => {
  if (appTestDataSource.isInitialized) {
    await appTestDataSource.destroy();
  }
});

