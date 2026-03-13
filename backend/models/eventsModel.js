import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
const randomCode = customAlphabet("1234567890ABDCEFG", 8);

const EventSchema = new mongoose.Schema(
  {
    title: String,
    date: Date,
    participants: {
      type: [mongoose.Types.ObjectId],
    },
    venue: String,
    description: String,
    fee: Number,
    maxParticipants: Number,
    deadline: Date,
    eventCode: {
      type: String,
      default: randomCode(),
    },
    footage: [String],
    theme: String,
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", EventSchema);

export { Event };
