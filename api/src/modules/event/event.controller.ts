import { Request, Response } from "express";
import { Event } from "./event.entity";
import { EventSchema, EventUpdateSchema } from "../../utils/validation";
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

export const getEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const eventRepository = appDataSource.getRepository(Event);
    const events = await eventRepository.find({
      where: { userId },
      order: { eventTime: "ASC" },
    });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = EventUpdateSchema.parse(req.body);

    const eventRepository = appDataSource.getRepository(Event);
    const event = await eventRepository.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (updateData.eventTime) {
      updateData.eventTime = new Date(updateData.eventTime).toISOString();
    }

    await eventRepository.update(id, updateData);

    const updatedEvent = await eventRepository.findOne({ where: { id } });
    return res.json(updatedEvent);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Failed to update event" });
  }
};
