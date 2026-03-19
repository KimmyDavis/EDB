import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
const randomCode = customAlphabet("1234567890ABDCEFG", 8);

const UserSchema = new mongoose.Schema(
  {
    username: String,
    name: String,
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    gender: {
      typpe: String,
      enum: ["m", "f"],
    },
    email: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phone: String,
    matricule: String,
    passport: String,
    algerianId: String,
    country: String,
    birthdate: String,
    course: String,
    picture: {
      type: String,
      default: "",
    },
    userCode: {
      type: String,
      default: randomCode(),
    },
    left: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);

export { User };
