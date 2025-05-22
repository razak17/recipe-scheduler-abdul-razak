import { Router } from "express";
import { createEvent, getEvents } from "./event.controller";

const router = Router();

router.post("/events", (req, res) => {
  createEvent(req, res);
});
router.get("/events", (req, res) => {
  getEvents(req, res);
});

export default router;
