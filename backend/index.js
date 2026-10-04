import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { logger, logEvents } from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import corsOptions from "./config/corsOptions.js";
import { dbMiddleware } from "./middleware/dbConnection.js";
import { configure as configurePush } from "./utils/pushHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cookieParser());
app.use(cors(corsOptions));

// using the mongodb middleware to handle multiple instamce reconnects in a serverless environment
app.use(dbMiddleware);

// Only bind a port when this file is run directly (e.g. local dev).
// In serverless environments the exported app is invoked by the platform.
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(PORT, () => {});
}

app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));

// routes
import songsRoutes from "./routes/songsRoutes.js";
import massRoutes from "./routes/massRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import uploadsRoutes from "./routes/uploadsRoutes.js";
app.use("/songs", songsRoutes);
app.use("/mass", massRoutes);
app.use("/events", eventsRoutes);
app.use("/users", usersRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/uploads", uploadsRoutes);

// register VAPID details for web push (no-op if keys are absent)
configurePush();

app.all(/.*/, (req, res) => {
  res.status(404);
  if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.on("error", (err) => {
  if (process.env.ENV === "dev")
    logEvents(
      `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
      "mongooseErrLog.log",
    );
});
export default app;
