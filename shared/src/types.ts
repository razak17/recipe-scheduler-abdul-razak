export interface ReminderJob {
	id: string;
	userId: string;
	title: string;
	eventTime: string;
}

export interface IEvent {
	id: string;
	userId: string;
	title: string;
	eventTime: Date;
	reminderMinutesBefore?: number;
	createdAt: Date;
}
