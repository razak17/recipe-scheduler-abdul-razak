import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('devices')
export class Device {
	@PrimaryGeneratedColumn()
	id: string;

	@Column({ unique: true })
	userId: string;

	@Column()
	pushToken: string;

	@CreateDateColumn()
	createdAt: Date;
}
