import { DataSource } from 'typeorm';
import { Event } from './modules/event/event.entity';
import { Device } from './modules/device/device.entity';

export const appDataSource = new DataSource({
	type: 'sqlite',
	database: 'cooking_scheduler.sqlite',
	entities: [Event, Device],
	synchronize: true
});
