import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { RegisterDeviceBody } from './device.schema';
import { appDataSource, Device } from '../../../../shared/src';

export const registerDevice = async (
	req: Request<Record<string, unknown>, Record<string, unknown>, RegisterDeviceBody>,
	res: Response
): Promise<any> => {
	try {
		const { userId, pushToken } = req.body;

		const deviceRepository = appDataSource.getRepository(Device);

		let device = await deviceRepository.findOne({ where: { userId } });

		if (device) {
			device.pushToken = pushToken;
			await deviceRepository.save(device);
		} else {
			device = deviceRepository.create({
				userId,
				pushToken
			});
			await deviceRepository.save(device);
		}

		return res.status(201).json(device);
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).json({ error: error.errors });
		}
		return res.status(500).json({ error: 'Failed to register device' });
	}
};
