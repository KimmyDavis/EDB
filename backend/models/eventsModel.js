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
    banner: {
      type: String,
      default: "",
    },
    translations: {
      type: [
        {
          language: {
            type: String,
            required: true,
          },
          body: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },
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
