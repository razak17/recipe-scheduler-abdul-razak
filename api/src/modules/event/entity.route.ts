import { Router } from "express";
import { createEvent } from "./event.controller";

const router = Router();

router.post("/events", (req, res) => {
  createEvent(req, res);
});

export default router;
