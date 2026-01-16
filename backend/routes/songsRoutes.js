import express from "express";
import songsController from "../controllers/songsController.js";

const router = express.Router();

router
  .route("/")
  .get(songsController.querySongs)
  .post(songsController.createSong)
  .patch(songsController.editSong);

export default router;
