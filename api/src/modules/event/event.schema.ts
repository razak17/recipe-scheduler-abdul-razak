import { TypeOf, number, object, string } from 'zod';

const createEventSchema = {
	body: object({
		title: string().min(1, 'Title is required'),
		eventTime: string().refine((val) => !isNaN(Date.parse(val)), {
			message: 'Event time must be in the future'
		}),
    userId: string().min(1, 'User ID is required'),
		reminderMinutesBefore: number().min(1).optional().default(15)
	})
};

const getEventSchema = {
	params: object({
		userId: string().min(1, 'Event ID is required')
	})
};

const updateEventSchema = {
	body: createEventSchema.body,
	params: object({
		id: string().min(1, 'Event ID is required')
	})
};

export type CreateEventBody = TypeOf<typeof createEventSchema.body>;
export type GetEventParams = TypeOf<typeof getEventSchema.params>;
export type UpdateEventBody = TypeOf<typeof updateEventSchema.body>;
export type UpdateEventParams = TypeOf<typeof updateEventSchema.params>;
export type DeleteEventParams = TypeOf<typeof updateEventSchema.params>;
