import { Request, Response } from 'express';
import { appDataSource } from '../../data-source';
import { ZodError } from 'zod';
import { Device } from './device.entity';
import { RegisterDeviceBody } from './device.schema';

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
