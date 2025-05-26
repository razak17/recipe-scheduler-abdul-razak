import { dataSource } from '../config/database';

export const checkDatabaseConnection = async (): Promise<boolean> => {
	try {
		await dataSource.query('SELECT 1');
		return true;
	} catch (error) {
		return false;
	}
};
