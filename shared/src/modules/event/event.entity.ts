import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	userId: string;

	@Column()
	title: string;

	@Column()
	eventTime: Date;

	@CreateDateColumn()
	createdAt: Date;

	@Column({ default: 15 })
	reminderMinutesBefore: number;
}
