import { Device } from '../../../../shared/src/modules/device/device.entity';
import { dataSource } from '../../config/database';

export async function getDeviceToken(userId: string): Promise<string | null> {
	const repo = dataSource.getRepository(Device);
	const device = await repo.findOne({ where: { userId } });
	return device ? device.pushToken : null;
}

export async function registerDevice(userId: string, pushToken: string): Promise<Device> {
	const repo = dataSource.getRepository(Device);
	let device = await repo.findOne({ where: { userId } });

	if (device) {
		device.pushToken = pushToken;
		await repo.save(device);
	} else {
		device = repo.create({ userId, pushToken });
		await repo.save(device);
	}

	return device;
}
