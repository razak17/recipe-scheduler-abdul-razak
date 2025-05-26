import { TypeOf, number, object, string } from 'zod';

export const registerDeviceSchema = {
	body: object({
		pushToken: string().min(1, 'Push token is required')
	})
};

export type RegisterDeviceBody = TypeOf<typeof registerDeviceSchema.body>;
