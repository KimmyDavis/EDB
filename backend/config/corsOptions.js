import allowedOrigins from "./allowedOrigins.js";
const corsOptions = {
  origin: true,
  origin: (origin, callBack) => {
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      !origin ||
      process.env.ENVIRONMENT === "dev"
    ) {
      callBack(null, true);
    } else {
      callBack(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
