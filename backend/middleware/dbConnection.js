import { dbConnect } from "../utils/mongodb.js";

const dbMiddleware = async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Database connection error", isError: true });
  }
};

export { dbMiddleware };
