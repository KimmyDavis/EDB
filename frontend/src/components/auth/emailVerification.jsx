"use client";

import LightRays from "@/components/backgrounds/light-rays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/authClient";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoaderCircle, MailCheck, RefreshCw } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export default function EmailVerification({ email: initialEmailProp = "" }) {
  const searchParams = useSearchParams();
  const { data } = authClient.useSession();
  const sessionEmail = data?.user?.email || "";
  const queryEmail = searchParams.get("email") || "";
  const defaultEmail = useMemo(
    () => initialEmailProp || queryEmail || sessionEmail,
    [initialEmailProp, queryEmail, sessionEmail],
  );

  const [email, setEmail] = useState(defaultEmail);
  const [isResending, setIsResending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!lastSentAt) return;
    const tick = () => {
      const elapsed = Date.now() - lastSentAt.getTime();
      const remaining = Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastSentAt]);

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSessionEmail = sessionEmail.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setIsResending(true);

      const shouldChangeEmail =
        Boolean(normalizedSessionEmail) &&
        normalizedEmail !== normalizedSessionEmail;

      if (shouldChangeEmail) {
        const { error: changeEmailError } = await authClient.changeEmail({
          newEmail: normalizedEmail,
          callbackURL: "/home",
        });

        if (changeEmailError) {
          const message = (changeEmailError.message || "").toLowerCase();
          if (
            message.includes("already") ||
            message.includes("exists") ||
            message.includes("duplicate")
          ) {
            toast.error(
              "This email is already in use. Please try another email address.",
            );
          } else {
            toast.error(
              changeEmailError.message ||
                "Could not update your email address.",
            );
          }
          return;
        }

        setEmail(normalizedEmail);
        setLastSentAt(new Date());
        toast.success(
          "Email updated. Check your inbox for the verification link. After verifying, please log in again to refresh your session.",
        );
        return;
      }

      const { error } = await authClient.sendVerificationEmail({
        email: normalizedEmail,
        callbackURL: "/home",
      });

      if (error) {
        toast.error(error.message || "Could not resend verification email.");
        return;
      }

      setLastSentAt(new Date());
      toast.success(
        "Verification email sent. Please check your inbox. After verifying, please log in again to refresh your session.",
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-theme-gold px-4 py-8">
      <div className="light-rays absolute left-0 top-0 h-screen w-screen">
        <LightRays
          raysOrigin="top-center"
          raysColor="#bc9106"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
        <Image
          src="/images/backgrounds/fabric-of-squares.png"
          width={1000}
          height={1000}
          alt="square fabric image background"
          className="fixed left-0 top-0 z-0 h-screen w-full object-cover"
        />
      </div>

      <div className="z-10 mx-4 w-full max-w-2xl rounded-xl border border-theme-cream/40 bg-[#fff2] p-8 backdrop-blur-[1px] sm:p-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-full bg-theme-cream/30 p-3">
            <MailCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Verify your email
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
              Check your inbox for a verification link to activate your Eglise
              de Boumerdes account and continue to the parish dashboard.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-theme-cream/35 bg-black/15 p-5 text-white/95">
          <p className="text-sm leading-7 sm:text-base">
            If you do not see the email, check your spam or promotions folder.
            You can also request a new verification email below.
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-full">
              <label className="mb-2 block text-sm text-white/85">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={isResending}
                className="rounded-none border-none bg-[#0003] text-white placeholder:text-white/55"
              />
            </div>
            <Button
              type="button"
              onClick={handleResend}
              disabled={isResending || secondsLeft > 0}
              className="min-w-52 rounded-none bg-theme-cream px-6 text-black hover:bg-theme-cream/90 disabled:opacity-60"
            >
              {isResending ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : secondsLeft > 0 ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4" />
                  Retry in {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Resend verification email
                </span>
              )}
            </Button>
          </div>

          {lastSentAt && (
            <p className="mt-4 text-xs text-theme-cream">
              Last email sent at {lastSentAt.toLocaleTimeString()}.
            </p>
          )}
        </div>

        <div className="mt-7 text-sm text-white/85">
          <p className="mb-3 rounded-md bg-black/20 px-3 py-2 text-xs text-white/90">
            After clicking the verification link, if you still see this page,
            please log in again so your account status updates in this app.
          </p>
          Already verified?{" "}
          <Link
            href="/"
            className="rounded-full bg-theme-cream px-2 py-0.5 text-black"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
