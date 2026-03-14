import express from "express";
import songsController from "../controllers/songsController.js";
import { checkJwt } from "../middleware/verifyJWT.js";

const router = express.Router();
router.get("/", songsController.querySongs);
router.use(checkJwt);
router
  .route("/")
  .post(songsController.createSong)
  .patch(songsController.editSong)
  .delete(songsController.deleteSong);

export default router;
