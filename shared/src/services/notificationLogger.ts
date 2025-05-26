import fs from 'fs/promises';
import path from 'path';

export interface NotificationLog {
	id: string;
	userId: string;
	title: string;
	body: string;
	timestamp: string;
	data?: any;
}

export class NotificationLogger {
	private logPath: string;

	constructor() {
		this.logPath = path.resolve(__dirname, '../../data/notification_logs.json');
	}
}

const logPath = path.resolve(__dirname, '../../data/notification_logs.json');

export async function readLogs(): Promise<NotificationLog[]> {
	try {
		const data = await fs.readFile(logPath, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		return [];
	}
}

export async function writeLogs(logs: NotificationLog[]): Promise<void> {
	await fs.writeFile(this.logPath, JSON.stringify(logs, null, 2));
}

export async function logNotification(
	notification: Omit<NotificationLog, 'id' | 'timestamp'>
): Promise<void> {
	const logs = await this.readLogs();
	const newLog: NotificationLog = {
		id: Math.random().toString(36).substr(2, 9),
		timestamp: new Date().toISOString(),
		...notification
	};

	logs.unshift(newLog); // Add new log at the beginning

	// Keep only last 100 logs
	const trimmedLogs = logs.slice(0, 100);

	await writeLogs(trimmedLogs);
}

export async function getRecentLogs(userId: string): Promise<NotificationLog[]> {
	const logs = await this.readLogs();
	return logs.filter((log: any) => log.userId === userId);
}
