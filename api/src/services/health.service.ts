import { appDataSource } from '../../../shared/src';

export const checkDatabaseConnection = async (): Promise<boolean> => {
	try {
		await appDataSource.query('SELECT 1');
		return true;
	} catch (error) {
		return false;
	}
};
