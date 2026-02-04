import mongoose from "mongoose";

import { customAlphabet } from "nanoid";
const randomCode = customAlphabet("1234567890CHRIST", 7);

const MassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      description: "The title of the mass.",
    },
    date: {
      type: Date,
      description: "Date the mass takes place.",
    },
    notes: {
      type: String,
      description: "Anything worth noting about the mass.",
    },
    psalmResponse: {
      type: String,
      description: "response to the responsorial Psalm.",
    },
    code: {
      type: String,
      default: randomCode(),
    },
    // songs
    entrance: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
    kyrie: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
    gloria: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
        recited: Boolean,
        included: Boolean,
      },
    },
    acclamation: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
        recited: Boolean,
      },
    },
    creed: {
      type: {
        recited: Boolean,
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
        included: Boolean,
      },
    },
    petition: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
    LordsPrayer: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
        recited: Boolean,
      },
    },
    offertory: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
    sanctus: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
    peace: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
    agnusDei: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
    holyCommunion: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
    thanksgiving: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
        included: Boolean,
      },
    },
    exit: {
      type: {
        songId: {
          type: mongoose.Types.ObjectId,
          ref: "Song",
        },
        structure: [String],
        sectionTitles: Boolean,
      },
    },
  },
  { timestamps: true }
);

const Mass = mongoose.model("Mass", MassSchema);

export { Mass };
