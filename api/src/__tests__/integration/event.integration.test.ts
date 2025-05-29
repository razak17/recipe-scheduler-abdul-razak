import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Event, User } from '../../../../shared/src';
import { connectDB, dataSource } from '../../config/database';
import app from '../../app';

dotenv.config({ path: '.env.test' });

export let testUserId: string;
export let authToken: string;

export const setupTestUser = async () => {
	const userRepository = dataSource.getRepository(User);

	await userRepository.delete({ email: 'test-events@example.com' });

	const hashedPassword = await bcrypt.hash('testPassword123', 10);
	const testUser = userRepository.create({
		email: 'test-events@example.com',
		password: hashedPassword,
		name: 'Test User'
	});

	const savedUser = await userRepository.save(testUser);
	testUserId = savedUser.id;

	const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_this_in_production';
	authToken = jwt.sign({ userId: savedUser.id }, secret, { expiresIn: '7d' });

	return testUser;
};

export const cleanupTestData = async (entityName: string, criteria: any) => {
	if (dataSource.isInitialized) {
		const repository = dataSource.getRepository(entityName);
		await repository.delete(criteria);
	}
};

describe('Event API Integration Tests', () => {
	let createdEventId: string;

	beforeAll(async () => {
		await connectDB(true);
		await setupTestUser();
	});

	afterAll(async () => {
		if (testUserId) {
			await cleanupTestData('Event', { userId: testUserId });
			await cleanupTestData('User', { id: testUserId });
		}
	});

	describe('Event CRUD Operations', () => {
		const testEvent = {
			title: 'Test Event',
			eventTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
			reminderMinutesBefore: 30
		};

		test('POST /api/events - Create a new event', async () => {
			console.log('Using test user ID:', testUserId);
			console.log('Using auth token:', authToken);

			const response = await request(app)
				.post('/api/events')
				.set('Authorization', `Bearer ${authToken}`)
				.send(testEvent);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('id');
			expect(response.body.title).toBe(testEvent.title);
			expect(response.body.userId).toBe(testUserId);
			expect(response.body.reminderMinutesBefore).toBe(testEvent.reminderMinutesBefore);

			createdEventId = response.body.id;
		});

		test('GET /api/events - Get user events with pagination', async () => {
			const response = await request(app)
				.get('/api/events')
				.set('Authorization', `Bearer ${authToken}`)
				.query({ page: 1, limit: 10 });

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('data');
			expect(response.body).toHaveProperty('pagination');
			expect(Array.isArray(response.body.data)).toBe(true);

			// Should contain our newly created event
			expect(response.body.data.length).toBeGreaterThan(0);

			const event = response.body.data.find((e: Event) => e.id === createdEventId);
			expect(event).toBeDefined();
			expect(event.title).toBe(testEvent.title);

			// Check pagination info
			expect(response.body.pagination).toHaveProperty('total');
			expect(response.body.pagination).toHaveProperty('page');
			expect(response.body.pagination).toHaveProperty('limit');
			expect(response.body.pagination).toHaveProperty('pages');
		});

		test('GET /api/events/:id - Get event by ID', async () => {
			const response = await request(app)
				.get(`/api/events/${createdEventId}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('id', createdEventId);
			expect(response.body.title).toBe(testEvent.title);
			expect(response.body.userId).toBe(testUserId);
		});

		test('PATCH /api/events/:id - Update an existing event', async () => {
			const updateData = {
				title: 'Updated Test Event',
				reminderMinutesBefore: 45
			};

			const response = await request(app)
				.patch(`/api/events/${createdEventId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.send(updateData);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('id', createdEventId);
			expect(response.body.title).toBe(updateData.title);
			expect(response.body.reminderMinutesBefore).toBe(updateData.reminderMinutesBefore);
			expect(response.body.userId).toBe(testUserId);
		});

		test('DELETE /api/events/:id - Delete an event', async () => {
			const response = await request(app)
				.delete(`/api/events/${createdEventId}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);

			// Verify event is deleted by trying to fetch it
			const checkResponse = await request(app)
				.get('/api/events')
				.set('Authorization', `Bearer ${authToken}`);

			expect(checkResponse.status).toBe(200);
			const deletedEvent = checkResponse.body.data.find((e: Event) => e.id === createdEventId);
			expect(deletedEvent).toBeUndefined();
		});
	});

	describe('Event batch operations', () => {
		// Create multiple events for testing pagination and sorting
		beforeAll(async () => {
			const events = [
				{
					title: 'Event A',
					eventTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
					reminderMinutesBefore: 10
				},
				{
					title: 'Event B',
					eventTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
					reminderMinutesBefore: 15
				},
				{
					title: 'Event C',
					eventTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
					reminderMinutesBefore: 20
				}
			];

			for (const event of events) {
				await request(app).post('/api/events').set('Authorization', `Bearer ${authToken}`).send(event);
			}
		});

		test('GET /api/events - Events should be sorted by eventTime in ascending order', async () => {
			const response = await request(app)
				.get('/api/events')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.length).toBeGreaterThanOrEqual(3);

			// Check if events are sorted by eventTime in ascending order
			const events = response.body.data;
			for (let i = 0; i < events.length - 1; i++) {
				const currentEventTime = new Date(events[i].eventTime).getTime();
				const nextEventTime = new Date(events[i + 1].eventTime).getTime();
				expect(currentEventTime).toBeLessThanOrEqual(nextEventTime);
			}
		});

		test('GET /api/events - Pagination should work correctly', async () => {
			// First page, limit 2
			const response1 = await request(app)
				.get('/api/events')
				.set('Authorization', `Bearer ${authToken}`)
				.query({ page: 1, limit: 2 });

			expect(response1.status).toBe(200);
			expect(response1.body.data.length).toBe(2);
			expect(response1.body.pagination.page).toBe(1);
			expect(response1.body.pagination.limit).toBe(2);

			// Second page, limit 2
			const response2 = await request(app)
				.get('/api/events')
				.set('Authorization', `Bearer ${authToken}`)
				.query({ page: 2, limit: 2 });

			expect(response2.status).toBe(200);
			expect(response2.body.pagination.page).toBe(2);

			// Ensure we got different events on different pages
			const firstPageIds = response1.body.data.map((e: Event) => e.id);
			const secondPageIds = response2.body.data.map((e: Event) => e.id);

			secondPageIds.forEach((id: string) => {
				expect(firstPageIds).not.toContain(id);
			});
		});
	});
});
