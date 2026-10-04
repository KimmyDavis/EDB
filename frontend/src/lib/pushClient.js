"use client";
import { authClient } from "@/lib/authClient";

const SW_PATH = "/service-worker.js";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URI;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const getRegistration = async () => {
  if (!isPushSupported()) return null;
  return navigator.serviceWorker.register(SW_PATH, { scope: "/" });
};

export const getExistingSubscription = async () => {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
  if (!registration) return null;
  return registration.pushManager.getSubscription();
};

export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported on this device.");
  }
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("Missing VAPID public key configuration.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await getRegistration();
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
};

export const unsubscribeFromPush = async () => {
  if (!isPushSupported()) return false;
  const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return false;
  return subscription.unsubscribe();
};

const authorizedHeaders = async () => {
  const { data } = await authClient.token();
  const headers = { "Content-Type": "application/json" };
  if (data?.token) headers.Authorization = `Bearer ${data.token}`;
  return headers;
};

const serializeSubscription = (subscription) => {
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
  };
};

const postSubscription = async (path, subscription) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: await authorizedHeaders(),
    credentials: "include",
    body: JSON.stringify({
      subscription: serializeSubscription(subscription),
      userAgent: navigator.userAgent,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to store push subscription.");
  }
  return response.json();
};

export const syncSubscription = (subscription) =>
  postSubscription("/notifications/sync", subscription);

export const registerSubscription = (subscription) =>
  postSubscription("/notifications/subscribe", subscription);

export const getSubscriptionStatus = async () => {
  const response = await fetch(`${API_URL}/notifications/status`, {
    headers: await authorizedHeaders(),
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) return { hasSubscription: false };
  return response.json();
};

export const sendTestNotification = async () => {
  const response = await fetch(`${API_URL}/notifications/test`, {
    method: "POST",
    headers: await authorizedHeaders(),
    credentials: "include",
  });
  return response.json();
};

/*
syncExistingSubscription
does: called after a successful login/signup. If the browser already holds a
      push subscription, it syncs it to the backend so the device entry is
      rebound to the account that just logged in.
*/
export const syncExistingSubscription = async () => {
  if (!isPushSupported()) return null;
  try {
    const existing = await getExistingSubscription();
    if (!existing) return null;
    await syncSubscription(existing);
    return existing;
  } catch (error) {
    return null;
  }
};
