import { Request, Response } from 'express';
import { dataSource } from '../../../config/database';
import { createEvent, deleteEvent, getEvents, updateEvent } from '../event.controller';

// Mock dependencies
jest.mock('../../../services/logger.service', () => ({
	logInfo: jest.fn(),
	logError: jest.fn()
}));

describe('Event Controller', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let eventRepositoryMock: any;
	let nextFunction: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		mockRequest = {
			body: {},
			params: {},
			query: {},
			userId: 'test_user_id'
		};

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
			send: jest.fn()
		};

		nextFunction = jest.fn();

		eventRepositoryMock = {
			findOne: jest.fn(),
			create: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			findAndCount: jest.fn()
		};

		jest.spyOn(dataSource, 'getRepository').mockReturnValue(eventRepositoryMock);
	});

	describe('createEvent', () => {
		it('should create an event successfully', async () => {
			mockRequest.body = {
				title: 'Test Event',
				eventTime: '2023-12-31T12:00:00Z',
				reminderMinutesBefore: 30
			};

			const mockEvent = {
				id: 'event_id',
				title: 'Test Event',
				eventTime: new Date('2023-12-31T12:00:00Z'),
				userId: 'test_user_id',
				reminderMinutesBefore: 30
			};

			eventRepositoryMock.create.mockReturnValue(mockEvent);

			await createEvent(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(eventRepositoryMock.create).toHaveBeenCalledWith({
				title: 'Test Event',
				eventTime: expect.any(Date),
				userId: 'test_user_id',
				reminderMinutesBefore: 30
			});
			expect(eventRepositoryMock.save).toHaveBeenCalledWith(mockEvent);
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith(mockEvent);
		});
	});

	describe('getEvents', () => {
		it('should get events with pagination', async () => {
			mockRequest.query = {
				page: '2',
				limit: '5'
			};

			const mockEvents = [
				{ id: 'event1', title: 'Event 1' },
				{ id: 'event2', title: 'Event 2' }
			];

			eventRepositoryMock.findAndCount.mockResolvedValue([mockEvents, 12]); // 12 total events

			await getEvents(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(eventRepositoryMock.findAndCount).toHaveBeenCalledWith({
				where: { userId: 'test_user_id' },
				order: { eventTime: 'ASC' },
				skip: 5,
				take: 5
			});

			expect(mockResponse.json).toHaveBeenCalledWith({
				events: mockEvents,
				pagination: {
					total: 12,
					page: 2,
					limit: 5,
					pages: 3
				}
			});
		});

		it('should use default pagination if not provided', async () => {
			mockRequest.query = {};

			eventRepositoryMock.findAndCount.mockResolvedValue([[], 0]);

			await getEvents(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(eventRepositoryMock.findAndCount).toHaveBeenCalledWith({
				where: { userId: 'test_user_id' },
				order: { eventTime: 'ASC' },
				skip: 0,
				take: 10
			});
		});
	});

	describe('updateEvent', () => {
		it('should update an event successfully', async () => {
			mockRequest.params = { id: 'event_id' };
			mockRequest.body = {
				title: 'Updated Event',
				reminderMinutesBefore: 45
			};

			const existingEvent = {
				id: 'event_id',
				title: 'Original Event',
				userId: 'test_user_id',
				reminderMinutesBefore: 15
			};

			const updatedEvent = {
				...existingEvent,
				title: 'Updated Event',
				reminderMinutesBefore: 45
			};

			eventRepositoryMock.findOne.mockResolvedValueOnce(existingEvent);
			eventRepositoryMock.update.mockResolvedValueOnce(updatedEvent);
			eventRepositoryMock.findOne.mockResolvedValueOnce(updatedEvent);

			await updateEvent(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(eventRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'event_id' } });
			expect(eventRepositoryMock.update).toHaveBeenCalledWith('event_id', {
				title: 'Updated Event',
				reminderMinutesBefore: 45
			});
		});

		it('should return 404 if event not found', async () => {
			mockRequest.params = { id: 'nonexistent_id' };
			mockRequest.body = { title: 'Updated Event' };

			eventRepositoryMock.findOne.mockResolvedValue(null);

			await updateEvent(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(eventRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'nonexistent_id' } });
			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Event not found' });
		});

		it('should return 403 if user does not own the event', async () => {
			mockRequest.params = { id: 'event_id' };
			mockRequest.body = { title: 'Updated Event' };
			mockRequest.userId = 'different_user_id';

			const existingEvent = {
				id: 'event_id',
				title: 'Original Event',
				userId: 'owner_user_id'
			};

			eventRepositoryMock.findOne.mockResolvedValue(existingEvent);

			await updateEvent(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(eventRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'event_id' } });
			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized to update this event' });
		});
	});

	describe('deleteEvent', () => {
		it('should delete an event successfully', async () => {
			mockRequest.params = { id: 'event_id' };

			const existingEvent = {
				id: 'event_id',
				title: 'Event to Delete',
				userId: 'test_user_id'
			};

			eventRepositoryMock.findOne.mockResolvedValue(existingEvent);

			await deleteEvent(mockRequest as Request, mockResponse as Response, nextFunction);

			// Assert
			expect(eventRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'event_id' } });
			expect(eventRepositoryMock.delete).toHaveBeenCalledWith('event_id');
		});

		it('should return 404 if event not found', async () => {
			mockRequest.params = { id: 'nonexistent_id' };

			eventRepositoryMock.findOne.mockResolvedValue(null);

			await deleteEvent(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(eventRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'nonexistent_id' } });
			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Event not found' });
		});

		it('should return 403 if user does not own the event', async () => {
			// Arrange
			mockRequest.params = { id: 'event_id' };
			mockRequest.userId = 'different_user_id';

			const existingEvent = {
				id: 'event_id',
				title: 'Event to Delete',
				userId: 'owner_user_id'
			};

			eventRepositoryMock.findOne.mockResolvedValue(existingEvent);

			await deleteEvent(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(eventRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'event_id' } });
			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized to delete this event' });
		});
	});
});
