import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { RegisterDeviceBody } from './device.schema';
import { appDataSource, Device } from '../../../../shared/src';
import { logInfo, logError } from '../../services/logger.service';

export const registerDevice = async (
	req: Request<Record<string, unknown>, Record<string, unknown>, RegisterDeviceBody>,
	res: Response
): Promise<any> => {
	try {
		const { userId, pushToken } = req.body;

		logInfo('Device registration attempt', { userId });

		const deviceRepository = appDataSource.getRepository(Device);

		let device = await deviceRepository.findOne({ where: { userId } });

		if (device) {
			logInfo('Updating existing device', { userId, deviceId: device.id });
			device.pushToken = pushToken;
			await deviceRepository.save(device);
		} else {
			logInfo('Creating new device', { userId });
			device = deviceRepository.create({
				userId,
				pushToken
			});
			await deviceRepository.save(device);
		}

		logInfo('Device registered successfully', {
			userId,
			deviceId: device.id
		});

		return res.status(201).json(device);
	} catch (error) {
		if (error instanceof ZodError) {
			logError('Validation error in device registration', error, {
				errors: error.errors
			});
			return res.status(400).json({ error: error.errors });
		}
		return res.status(500).json({ error: 'Failed to register device' });
	}
};
