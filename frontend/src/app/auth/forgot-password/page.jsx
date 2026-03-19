"use client";

import LightRays from "@/components/backgrounds/light-rays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/authClient";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const tokenFromQuery = searchParams.get("token") || "";
  const errorFromQuery = searchParams.get("error");
  const isBusy = isRequestingCode || isResettingPassword;

  useEffect(() => {
    if (!tokenFromQuery) return;
    setResetCode(tokenFromQuery);
  }, [tokenFromQuery]);

  useEffect(() => {
    if (errorFromQuery !== "INVALID_TOKEN") return;
    toast.error(
      "This reset code is invalid or has expired. Request a new one.",
    );
  }, [errorFromQuery]);

  const handleRequestResetCode = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsRequestingCode(true);

    try {
      const redirectTo = `${window.location.origin}/auth/forgot-password`;
      const { error } = await authClient.requestPasswordReset({
        email: trimmedEmail,
        redirectTo,
      });

      if (error) {
        toast.error(error.message || "Could not send a reset code.");
        return;
      }

      toast.success(
        "If an account exists for that email, a reset code has been sent.",
      );
    } catch {
      toast.error("Something went wrong while sending the reset code.");
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const trimmedCode = resetCode.trim();

    if (!trimmedCode) {
      toast.error("Enter the reset code from your email.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setIsResettingPassword(true);

    try {
      const { error } = await authClient.resetPassword({
        token: trimmedCode,
        newPassword,
      });

      if (error) {
        toast.error(error.message || "Could not reset your password.");
        return;
      }

      toast.success("Your password has been reset. You can sign in now.");
      router.push("/");
    } catch {
      toast.error("Something went wrong while resetting your password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="relative bg-theme-gold w-full min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-screen h-screen light-rays">
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
          className="fixed top-0 left-0 w-full h-screen object-cover z-0"
        />
      </div>

      <div className="sign-up-form z-10 w-full max-w-200 bg-[#fff2] rounded-xl pt-10 pb-16 m-1">
        <div className="flex items-center justify-between gap-4 px-5">
          <div>
            <h1 className="h1 pb-2 text-3xl text-white">Eglise De Boumerdes</h1>
            <h3 className="h3">Reset password</h3>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/10 px-4 py-2 text-sm text-white transition hover:bg-black/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        </div>

        <div className="mt-8 grid gap-8 px-8 lg:grid-cols-[1.05fr_1fr]">
          <div className="rounded-2xl border border-white/15 bg-black/10 p-6 text-white">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-theme-cream/20 text-theme-cream">
              <KeyRound className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold">Reset access securely</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Request a reset code with your email address, then paste that code
              below with your new password. If you open the email button, the
              code is filled in automatically.
            </p>
            <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-theme-cream" />
                <p>Use the same email address attached to your account.</p>
              </div>
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-4 w-4 text-theme-cream" />
                <p>The emailed code is single-use and expires automatically.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <form
              onSubmit={handleRequestResetCode}
              className="rounded-2xl border border-white/15 bg-black/10 p-6"
            >
              <h4 className="text-lg font-semibold text-white">
                1. Send reset code
              </h4>
              <p className="mt-2 text-sm text-white/75">
                We will email a reset code if an account exists for this
                address.
              </p>

              <div className="mt-5">
                <Label className="mb-2" htmlFor="reset-email">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBusy}
                  required
                  className="text-white rounded-none border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <Button
                type="submit"
                disabled={isBusy}
                className="mt-6 w-full rounded-none"
              >
                {isRequestingCode ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  "Email reset code"
                )}
              </Button>
            </form>

            <form
              onSubmit={handleResetPassword}
              className="rounded-2xl border border-white/15 bg-black/10 p-6"
            >
              <h4 className="text-lg font-semibold text-white">
                2. Enter code and new password
              </h4>
              <p className="mt-2 text-sm text-white/75">
                Paste the code from your email, then choose a new password.
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <Label className="mb-2" htmlFor="reset-code">
                    Reset code
                  </Label>
                  <Input
                    id="reset-code"
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    disabled={isBusy}
                    required
                    className="text-white rounded-none border-none bg-[#0003] font-mono tracking-[0.18em] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label className="mb-2" htmlFor="new-password">
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isBusy}
                      required
                      className="pr-12 text-white rounded-none border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showNewPassword}
                      disabled={isBusy}
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/80 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2" htmlFor="confirm-password">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isBusy}
                      required
                      className="pr-12 text-white rounded-none border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showConfirmPassword}
                      disabled={isBusy}
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/80 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isBusy}
                className="mt-6 w-full rounded-none"
              >
                {isResettingPassword ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Resetting password...
                  </span>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
