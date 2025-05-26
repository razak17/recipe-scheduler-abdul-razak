import { DataSource } from 'typeorm';
import { Event } from '../modules/event/event.entity';
import { Device } from '../modules/device/device.entity';
import { User } from '../modules/user/user.model';

export const appDataSource = new DataSource({
	type: 'sqlite',
	database: '../data/recipe_scheduler.sqlite',
	entities: [Event, Device, User],
	synchronize: true
});
