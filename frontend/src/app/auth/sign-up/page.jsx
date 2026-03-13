"use client";
import LightRays from "@/components/backgrounds/light-rays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/authClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const page = () => {
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
        username: name,
        callbackURL: "/",
      },
      {
        onRequest: (ctx) => {
          setIsSubmitting(true);
          console.log(ctx);
        },
        onSuccess: (ctx) => {
          setIsSubmitting(false);
          console.log(ctx);
          router.push("/");
        },
        onError: (ctx) => {
          setIsSubmitting(false);
          alert(ctx.error.message);
          console.log(ctx);
        },
      },
    );
    console.log(data);
    console.log(error);
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
              className="text-white rounded-none border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="text-white rounded-none border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="text-white rounded-none border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="text-white rounded-none border-none bg-[#0003] disabled:opacity-60 disabled:cursor-not-allowed"
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
            className="w-max px-10 py-2 mx-auto rounded-none min-w-40"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Creating...
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
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

export default page;
