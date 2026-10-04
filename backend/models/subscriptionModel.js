import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description:
        "The push service endpoint. Uniquely identifies a browser/device.",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      description: "The account currently bound to this device.",
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    userAgent: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export { Subscription };
