import { TypeOf, number, object, string } from 'zod';

export const registerDeviceSchema = {
	body: object({
		userId: string().min(1, 'User ID is required'),
		pushToken: string().min(1, 'Push token is required')
	})
};

export type RegisterDeviceBody = TypeOf<typeof registerDeviceSchema.body>;
