"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import usePublicRoute from "@/hooks/use-public-route";
import {
  getExistingSubscription,
  getSubscriptionStatus,
  isPushSupported,
  registerSubscription,
  syncSubscription,
  subscribeToPush,
} from "@/lib/pushClient";

const CHECKING = "checking";
const SUBSCRIBED = "subscribed";
const UNSUBSCRIBED = "unsubscribed";

export default function PushSubscriptionGate({ children }) {
  const isPublicRoute = usePublicRoute();
  const { data, isPending } = authClient.useSession();
  const userId = data?.user?.id;
  const hasSession = Boolean(data?.session);

  const [status, setStatus] = useState(CHECKING);
  const [dismissed, setDismissed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const evaluate = async () => {
      if (
        isPending ||
        !hasSession ||
        isPublicRoute ||
        !isPushSupported()
      ) {
        if (!cancelled) setStatus(SUBSCRIBED);
        return;
      }

      if (!cancelled) setStatus(CHECKING);

      try {
        const existing = await getExistingSubscription();
        if (existing) {
          // A device that already has a subscription may now belong to a
          // different account - rebind it to the current user.
          await syncSubscription(existing).catch(() => {});
        }
        const { hasSubscription } = await getSubscriptionStatus();
        if (!cancelled) {
          setStatus(hasSubscription ? SUBSCRIBED : UNSUBSCRIBED);
        }
      } catch (error) {
        if (!cancelled) setStatus(UNSUBSCRIBED);
      }
    };

    evaluate();
    return () => {
      cancelled = true;
    };
  }, [isPending, hasSession, isPublicRoute, userId]);

  const handleEnable = async () => {
    setSubscribing(true);
    try {
      const subscription = await subscribeToPush();
      await registerSubscription(subscription);
      setStatus(SUBSCRIBED);
      toast.success("Notifications enabled.");
    } catch (error) {
      toast.error(error.message || "Could not enable notifications.");
    } finally {
      setSubscribing(false);
    }
  };

  const showGate =
    status === UNSUBSCRIBED && !dismissed && hasSession && !isPublicRoute;

  return (
    <>
      {children}
      {showGate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-theme-gold/30 bg-theme-cream p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-gold text-white">
                <Bell className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Stay updated?</h2>
            </div>
            <p className="mb-6 text-sm text-slate-700">
              Get reminders for upcoming Masses, event deadlines, and
              announcements from the parish.
            </p>
            <Button
              onClick={handleEnable}
              disabled={subscribing}
              className="w-full bg-theme-gold text-white hover:bg-theme-gold/90"
            >
              {subscribing ? "Enabling..." : "Enable Notifications"}
            </Button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              disabled={subscribing}
              className="mt-4 w-full text-center text-xs text-slate-500 underline underline-offset-4 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue without subscribing
            </button>
          </div>
        </div>
      )}
    </>
  );
}
