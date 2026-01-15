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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cookieParser());
app.use(cors(corsOptions));

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to database and running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));

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
  console.log(err);
  if (process.env.ENV === "dev")
    logEvents(
      `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
      "mongooseErrLog.log"
    );
});
export default app;
