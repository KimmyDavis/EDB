import webpush from "web-push";
import { Subscription } from "../models/subscriptionModel.js";
import { User } from "../models/usersModel.js";
import { logEvents } from "../middleware/logger.js";

const DEFAULT_BADGE = `${
  process.env.FRONTEND_URL || ""
}/images/EDB-logo.png`;
const DEFAULT_ICON = DEFAULT_BADGE;

const DELIVERY_KEYS = ["ttl", "TTL", "urgency", "topic"];

let configured = false;

/*
configure
does: registers the VAPID details with the web-push library.
      Safe to call multiple times. Returns false if keys are missing.
*/
const configure = () => {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT || "mailto:admin@eglise-boumerdes.com";

  if (!publicKey || !privateKey || !subject) {
    logEvents(
      "Push notifications disabled: missing VAPID configuration.",
      "pushLog.log",
    );
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
};

const extractDeliveryOptions = (options = {}) => {
  const delivery = {};
  if (options.ttl !== undefined) delivery.TTL = options.ttl;
  if (options.TTL !== undefined) delivery.TTL = options.TTL;
  if (options.urgency !== undefined) delivery.urgency = options.urgency;
  if (options.topic !== undefined) delivery.topic = options.topic;
  return delivery;
};

/*
buildNotification
does: normalizes the provided options into a Notification-like payload,
      defaulting icon and badge to the EDB logo. Any extra attribute the
      caller provides is passed through untouched.
*/
const buildNotification = (options = {}) => {
  const notification = {};

  Object.keys(options).forEach((key) => {
    if (DELIVERY_KEYS.includes(key)) return;
    if (options[key] === undefined) return;
    notification[key] = options[key];
  });

  if (!notification.title) notification.title = "Eglise de Boumerdes";
  if (!notification.icon) notification.icon = DEFAULT_ICON;
  if (!notification.badge) notification.badge = DEFAULT_BADGE;

  return notification;
};

/*
sendToSubscription
does: sends a push notification to a single stored subscription.
      Prunes the subscription from the database when the push service
      reports it as no longer valid (404 / 410 / 403).
*/
const sendToSubscription = async (subscriptionDoc, notificationOptions) => {
  if (!configure()) {
    return { endpoint: subscriptionDoc.endpoint, ok: false, error: "not-configured" };
  }

  const notification = buildNotification(notificationOptions);
  const deliveryOptions = extractDeliveryOptions(notificationOptions);
  const pushSubscription = {
    endpoint: subscriptionDoc.endpoint,
    keys: subscriptionDoc.keys,
  };

  try {
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(notification),
      deliveryOptions,
    );
    return { endpoint: subscriptionDoc.endpoint, ok: true };
  } catch (error) {
    const statusCode = error?.statusCode;
    if ([403, 404, 410].includes(statusCode)) {
      await Subscription.deleteOne({ _id: subscriptionDoc._id });
    }
    return {
      endpoint: subscriptionDoc.endpoint,
      ok: false,
      statusCode,
      error: error?.body || error?.message,
    };
  }
};

const sendToSubscriptions = async (subscriptionDocs, notificationOptions) => {
  const details = await Promise.all(
    subscriptionDocs.map((doc) =>
      sendToSubscription(doc, notificationOptions),
    ),
  );
  const sent = details.filter((detail) => detail.ok).length;
  return { sent, failed: details.length - sent, details };
};

/*
dispatchToUserIds
receives: an array of user ids, plus all the attributes of the notification.
does: sends the notification to every active device bound to those users.
*/
const dispatchToUserIds = async (userIds, notificationOptions) => {
  const subscriptions = await Subscription.find({
    userId: { $in: userIds },
    active: true,
  }).lean();
  return sendToSubscriptions(subscriptions, notificationOptions);
};

/*
dispatchToUser
receives: a single user id, plus all the attributes of the notification.
does: sends the notification to every active device of that user.
*/
const dispatchToUser = async (userId, notificationOptions) => {
  return dispatchToUserIds([userId], notificationOptions);
};

/*
dispatchToRole
receives: a role name ("user" | "admin" | "liturgy" | "media"),
          plus all the attributes of the notification.
does: sends the notification to every device belonging to users of that role.
*/
const dispatchToRole = async (role, notificationOptions) => {
  const users = await User.find({ role }).select("_id").lean();
  return dispatchToUserIds(
    users.map((user) => user._id),
    notificationOptions,
  );
};

/*
dispatchToMany
receives: { userIds?, roles? } and all the attributes of the notification.
does: resolves the target users/devices and sends the notification.
*/
const dispatchToMany = async ({ userIds = [], roles = [] }, notificationOptions) => {
  const ids = new Set(userIds.map(String));

  if (roles.length) {
    const users = await User.find({ role: { $in: roles } })
      .select("_id")
      .lean();
    users.forEach((user) => ids.add(String(user._id)));
  }

  return dispatchToUserIds([...ids], notificationOptions);
};

/*
dispatchToAll
receives: all the attributes of the notification.
does: sends the notification to every active subscription.
*/
const dispatchToAll = async (notificationOptions) => {
  const subscriptions = await Subscription.find({ active: true }).lean();
  return sendToSubscriptions(subscriptions, notificationOptions);
};

/*
dispatch
receives: all the attributes of the notification, plus an optional target:
          { to: { userId } | { role } | { userIds } | { roles } | "all" }
does: routes the notification to the correct audience. Defaults to all.
*/
const dispatch = async (notificationOptions = {}) => {
  const { to, ...payload } = notificationOptions;

  if (!to || to === "all") return dispatchToAll(payload);
  if (to.userId) return dispatchToUser(to.userId, payload);
  if (to.role) return dispatchToRole(to.role, payload);
  return dispatchToMany(
    { userIds: to.userIds || [], roles: to.roles || [] },
    payload,
  );
};

export {
  configure,
  dispatch,
  dispatchToAll,
  dispatchToMany,
  dispatchToRole,
  dispatchToUser,
  dispatchToUserIds,
  sendToSubscription,
};
