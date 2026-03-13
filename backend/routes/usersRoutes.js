import express from "express";
import usersController from "../controllers/usersController.js";
import { checkJwt } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(checkJwt);

router
  .route("/")
  .get(usersController.queryUsers)
  .patch(usersController.updateUser);

export default router;
