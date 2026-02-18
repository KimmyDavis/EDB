import mongoose from "mongoose";

import { customAlphabet } from "nanoid";
const randomCode = customAlphabet("1234567890ABDCEFG", 7);

const SongSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      description: "The title of the song.",
    },
    service: {
      type: String,
      enum: ["catholic", "evangelical", "both"],
      descripton:
        "The type of service the song is composed for. Whether catholic, evangelical or both.",
    },
    sections: {
      type: [String],
      description:
        "The sections of the catholic mass if it is a catholic song.",
    },
    section: {
      type: String,
      enum: [
        "entrance",
        "kyrie",
        "gloria",
        "acclamation",
        "creed",
        "petition",
        "Lord's prayer",
        "offertory",
        "sanctus",
        "peace",
        "agnus Dei",
        "holy communion",
        "thanksgiving",
        "exit",
      ],
      description: "The section of the catholic mass if it is a catholic song.",
    },
    category: {
      type: String,
      enum: ["praise", "worship"],
      description:
        "The category of the song if it is meant for the evangelical service.",
    },
    verses: {
      type: [String],
      description: "The verses of the song.",
    },
    chorus: {
      type: String,
      description: "The song's chrous if any.",
    },
    bridge: {
      type: String,
      description: "The song's bridge if any.",
    },
    links: {
      type: [String],
      description:
        "A link to the song online... could be YouTube or any other online resource. Meant for practicing the song.",
    },
    key: {
      type: String,
      description: "The musical key for the song.",
    },
    code: {
      type: String,
      default: randomCode(),
    },
    structure: {
      type: [String],
      description: "The top to bottom structure of a song",
    },
  },
  { timestamps: true }
);

const Song = mongoose.model("Song", SongSchema);

export { Song };
