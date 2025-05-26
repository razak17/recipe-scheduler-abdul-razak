import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Device } from '../../../../shared/src';
import { dataSource } from '../../config/database';
import { logError, logInfo } from '../../services/logger.service';
import { RegisterDeviceBody } from './device.schema';

export const registerDevice = async (
	req: Request<Record<string, unknown>, Record<string, unknown>, RegisterDeviceBody>,
	res: Response
): Promise<any> => {
	try {
		const { pushToken } = req.body;
		const userId = req.userId;

		if (!userId) {
			logError('User ID is missing in request', { body: req.body });
			return res.status(401).json({ error: 'Unauthorized' });
		}

		logInfo('Device registration attempt', { userId });

		const deviceRepository = dataSource.getRepository(Device);

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
