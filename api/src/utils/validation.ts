import { z } from "zod";

export const EventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  eventTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid ISO date format",
    }),
  reminderMinutesBefore: z.number().min(1).optional().default(15),
});

export const EventUpdateSchema = EventSchema.partial();

export const DeviceSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  pushToken: z.string().min(1, "Push token is required"),
});

export type EventInput = z.infer<typeof EventSchema>;
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>;
export type DeviceInput = z.infer<typeof DeviceSchema>;
