import express from "express";
import massController from "../controllers/massController.js";

const router = express.Router();

router
  .route("/")
  .get(massController.queryMass)
  .post(massController.createMass)
  .patch(massController.editMass);

export default router;
