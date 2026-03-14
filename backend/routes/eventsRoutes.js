import express from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  joinOrLeaveEvent,
  downloadEventParticipantsPdf,
} from "../controllers/eventsController.js";
import { checkJwt } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(checkJwt);

router.route("/").get(getEvents).post(createEvent).patch(updateEvent);
router.patch("/joinOrLeave", joinOrLeaveEvent);
router.post("/participants/pdf", downloadEventParticipantsPdf);

router.delete("/:id", deleteEvent);

export default router;
