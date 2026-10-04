import express from "express";
import mongoose from "mongoose";
import { Subscription } from "../models/subscriptionModel.js";
import { User } from "../models/usersModel.js";
import { checkJwt } from "../middleware/verifyJWT.js";
import { dispatchToUser, dispatchToRole } from "../utils/pushHelper.js";
import { logEvents } from "../middleware/logger.js";

const router = express.Router();

const EDITOR_ROLES = ["admin", "liturgy", "media"];
const isProduction =
  process.env.NODE_ENV === "production" || process.env.ENV === "production";

const getUserId = (req) =>
  req.auth?.sub || req.auth?.id || req.auth?.userId || null;

const isValidUserId = (userId) =>
  Boolean(userId) && mongoose.Types.ObjectId.isValid(userId);

/*
POST /notifications/sync
called after every successful login/signup. Creates the device entry when it
does not exist yet, or rebinds it to the current user when the account tied
to the device has changed.
*/
const syncSubscription = async (req, res) => {
  const userId = getUserId(req);
  if (!isValidUserId(userId)) {
    return res.status(401).json({ message: "Invalid session." });
  }

  const { subscription, userAgent } = req.body || {};
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return res
      .status(400)
      .json({ message: "A valid push subscription is required." });
  }

  const saved = await Subscription.findOneAndUpdate(
    { endpoint },
    {
      $set: {
        userId,
        keys: { p256dh, auth },
        active: true,
        lastSyncedAt: new Date(),
        ...(userAgent ? { userAgent } : {}),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return res.status(200).json({
    message: "Subscription synced.",
    subscriptionId: saved._id,
  });
};

/*
POST /notifications/unsubscribe
removes a device subscription that belongs to the current user.
*/
const unsubscribe = async (req, res) => {
  const userId = getUserId(req);
  if (!isValidUserId(userId)) {
    return res.status(401).json({ message: "Invalid session." });
  }

  const { endpoint } = req.body || {};
  if (!endpoint) {
    return res.status(400).json({ message: "An endpoint is required." });
  }

  const result = await Subscription.deleteOne({ endpoint, userId });
  return res.status(200).json({
    message: "Unsubscribed.",
    removed: result.deletedCount,
  });
};

/*
GET /notifications/status
tells the client whether the current user has any active device subscribed.
*/
const getStatus = async (req, res) => {
  const userId = getUserId(req);
  if (!isValidUserId(userId)) {
    return res.status(401).json({ message: "Invalid session." });
  }

  const count = await Subscription.countDocuments({ userId, active: true });
  return res.status(200).json({ hasSubscription: count > 0 });
};

/*
POST /notifications/test
dev-only helper that dispatches a test notification to the current editor.
*/
const sendTest = async (req, res) => {
  if (isProduction) {
    return res.status(404).json({ message: "Not found." });
  }

  const userId = getUserId(req);
  if (!isValidUserId(userId)) {
    return res.status(401).json({ message: "Invalid session." });
  }

  const user = await User.findById(userId).lean();
  if (!user || !EDITOR_ROLES.includes(user.role)) {
    return res
      .status(403)
      .json({ message: "Only editors can send test notifications." });
  }

  const result = await dispatchToUser(userId, {
    title: "EDB test notification",
    body: "Push notifications are working.",
    tag: "edb-test",
    data: { url: "/home" },
    ttl: 60,
  });

  return res.status(200).json({ message: "Test dispatched.", ...result });
};

/*
POST /notifications/account-pending
notifies all admins that a new account awaits approval. Accepts either a
valid JWT (email signup flow) or a trusted internal hook call carrying the
X-Internal-Secret header (Better Auth user.creation hook covers social signup).
*/
const announceAccountPending = async (req, res) => {
  let userId = getUserId(req);

  if (!isValidUserId(userId)) {
    const headerSecret = req.headers["x-internal-secret"];
    const expected = process.env.INTERNAL_HOOK_SECRET;
    if (expected && headerSecret === expected) {
      userId = String(req.body?.userId || "").trim();
    }
  }

  if (!isValidUserId(userId)) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const user = await User.findById(userId)
    .select("name username email")
    .lean();
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const result = await dispatchToRole("admin", {
    title: "New account pending approval",
    body: `${user.name || user.username || user.email} just created an account awaiting approval.`,
    data: { url: "/auth/admin-actions" },
    tag: "admin-approval",
    ttl: 60 * 60 * 24 * 7,
  });

  return res.status(200).json({ message: "Admins notified.", ...result });
};

// public route (auth handled inside) - must be registered before checkJwt
router.post("/account-pending", announceAccountPending);

router.use(checkJwt);

router.post("/sync", syncSubscription);
router.post("/subscribe", syncSubscription);
router.post("/unsubscribe", unsubscribe);
router.get("/status", getStatus);
router.post("/test", sendTest);

export default router;
