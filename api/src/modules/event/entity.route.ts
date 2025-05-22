import { Router } from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from "./event.controller";

const router = Router();

router.post("/events", createEvent);
router.get("/events", getEvents);
router.patch("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

export default router;
