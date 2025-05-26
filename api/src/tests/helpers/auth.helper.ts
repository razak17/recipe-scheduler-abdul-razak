import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../../../shared/src';
import { dataSource } from '../../config/database';

export const generateTestToken = (userId: string): string => {
	return jwt.sign({ userId }, process.env.JWT_SECRET || 'test_jwt_secret', {
		expiresIn: '1h'
	});
};

export const createTestUser = async (
	email: string = 'test@example.com',
	password: string = 'password123',
	role: 'user' | 'admin' = 'user'
): Promise<User> => {
	const userRepository = dataSource.getRepository(User);

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = userRepository.create({
		email,
		password: hashedPassword,
		name: 'Test User',
		role
	});

	await userRepository.save(user);
	return user;
};
