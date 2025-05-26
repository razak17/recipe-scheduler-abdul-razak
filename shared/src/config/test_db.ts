import { DataSource } from 'typeorm';
import { Event } from '../modules/event/event.entity';
import { Device } from '../modules/device/device.entity';
import { User } from '../modules/user/user.entity';

export const testDataSource = new DataSource({
	type: 'sqlite',
	database: '../data/recipe_scheduler_test.sqlite',
	entities: [Event, Device, User],
	synchronize: true
});
