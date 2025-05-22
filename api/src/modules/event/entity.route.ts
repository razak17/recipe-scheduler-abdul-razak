import { Router } from "express";
import { createEvent, getEvents, updateEvent } from "./event.controller";

const router = Router();

router.post("/events", (req, res) => {
  createEvent(req, res);
});
router.get("/events", (req, res) => {
  getEvents(req, res);
});
router.patch("/events/:id", (req, res) => {
  updateEvent(req, res);
});

export default router;
