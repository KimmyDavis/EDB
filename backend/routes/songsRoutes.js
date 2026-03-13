import express from "express";
import songsController from "../controllers/songsController.js";
import { checkJwt } from "../middleware/verifyJWT.js";

const router = express.Router();
router.use(checkJwt);
router
  .route("/")
  .get(songsController.querySongs)
  .post(songsController.createSong)
  .patch(songsController.editSong)
  .delete(songsController.deleteSong);

export default router;
