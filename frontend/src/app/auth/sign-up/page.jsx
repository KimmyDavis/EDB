"use client";
import LightRays from "@/components/backgrounds/light-rays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/authClient";
import { syncExistingSubscription } from "@/lib/pushClient";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const SignUpPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.length < 3) {
      toast("Username too short!");
      return;
    }
    if (password.length < 6) {
      toast("Password too short!");
      return;
    }
    if (password != rePassword) {
      toast("Passwords don't match!");
      return;
    }

    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
        username: name.replaceAll(" ", ""),
        callbackURL: "/",
      },
      {
        onRequest: (ctx) => {
          setIsSubmitting(true);
        },
        onSuccess: async (ctx) => {
          setIsSubmitting(false);
          await syncExistingSubscription();
          router.push("/");
        },
        onError: (ctx) => {
          setIsSubmitting(false);
          alert(ctx.error.message);
        },
      },
    );
  };

  const signUpOnGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
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
      <div className="sign-up-form z-10 w-full max-w-200 bg-[#fff2] rounded-xl pt-10 pb-16 mx-5 ">
        <h1 className="h1 pb-2 text-3xl text-white px-5">
          Eglise De Boumerdes
        </h1>
        <h3 className="h3 pb-8 px-8">Create account</h3>
        <form onSubmit={handleSubmit} className="flex px-10 flex-col gap-10">
          <div className="username">
            <Label className="mb-2" htmlFor="username">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              className="text-white rounded-xl border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div className="email">
            <Label className="mb-2" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              className="text-white rounded-xl border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div className="password">
            <Label className="mb-2" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              className="text-white rounded-xl border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div className="re-password">
            <Label className="mb-2" htmlFor="re-password">
              Retype password
            </Label>
            <Input
              id="re-password"
              type="password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              disabled={isSubmitting}
              required
              className="text-white rounded-xl border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          {isSubmitting && (
            <div className="flex items-center justify-center gap-3 rounded-lg border border-white/15 bg-black/10 px-4 py-3 text-sm text-white/90">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>Creating your account. Please wait...</span>
            </div>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-theme-gold text-white font-semibold hover:bg-theme-gold/90 min-w-40 active:brightness-150"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Creating...
              </span>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
        <div className="social">
          <div className="google w-full flex flex-row justify-center">
            <Button
              type="button"
              onClick={signUpOnGoogle}
              disabled={isSubmitting}
              className="bg-theme-gold/90 my-5 py-5 px-6 active:brightness-150"
            >
              <FcGoogle className="scale-200 m-3" /> continue with google
            </Button>
          </div>
        </div>
        <div className="no-account text-center mt-8">
          or{" "}
          <span
            className={`sign-up bg-theme-cream px-1 rounded-3xl ${isSubmitting ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            onClick={() => {
              if (!isSubmitting) router.push("/");
            }}
          >
            sign in
          </span>{" "}
          to login to your account.
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
