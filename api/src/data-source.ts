import { DataSource } from 'typeorm';
import { Event } from './modules/event/event.entity';

export const appDataSource = new DataSource({
	type: 'sqlite',
	database: 'cooking_scheduler.sqlite',
	entities: [Event],
	synchronize: true
});
