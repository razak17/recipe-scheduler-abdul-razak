import { Request, Response } from "express";
import { Event } from "./event.entity";
import { EventSchema } from "../../utils/validation";
import { ZodError } from "zod";
import { appDataSource } from "../../data-source";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, eventTime, reminderMinutesBefore } = EventSchema.parse(
      req.body,
    );
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const eventRepository = appDataSource.getRepository(Event);
    const event = eventRepository.create({
      title,
      eventTime: new Date(eventTime),
      userId,
      reminderMinutesBefore: reminderMinutesBefore || 15,
    });

    await eventRepository.save(event);
    return res.status(201).json(event);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Failed to create event" });
  }
};
