"use client";
import LightRays from "@/components/backgrounds/light-rays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCredentials } from "@/features/auth/authSlice";
import { authClient } from "@/lib/authClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const page = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // handlers
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");

    const authCallbacks = {
      onRequest: () => {
        setIsSubmitting(true);
      },
      onSuccess: async (ctx) => {
        setIsSubmitting(false);
        const { data: jwtData } = await authClient.token();
        if (jwtData)
          dispatch(
            setCredentials({
              accessToken: jwtData.token,
              sessionToken: ctx.data.token,
            }),
          );
        router.push("/home");
      },
      onError: (ctx) => {
        setIsSubmitting(false);
        toast(ctx.error.message);
      },
    };

    if (isEmail) {
      await authClient.signIn.email(
        {
          email: trimmedIdentifier,
          password,
          rememberMe: true,
        },
        authCallbacks,
      );
      return;
    }

    await authClient.signIn.username(
      {
        username: trimmedIdentifier,
        password,
        rememberMe: true,
      },
      authCallbacks,
    );
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
        <h3 className="h3 pb-8 px-8">Log in</h3>
        <form onSubmit={handleSubmit} className="flex px-10 flex-col gap-10">
          <div className="identifier">
            <Label className="mb-2" htmlFor="identifier">
              Email or Username
            </Label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder=""
              className="text-white rounded-none border-none bg-[#0003]"
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
              required
              className="text-white rounded-none border-none bg-[#0003]"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-max px-10 py-2 mx-auto rounded-none"
          >
            {isSubmitting ? "Authenticating..." : "Login"}
          </Button>
        </form>
        <div className="no-account text-center mt-8">
          or{" "}
          <span
            className="sign-up bg-theme-cream px-1 rounded-3xl cursor-pointer"
            onClick={() => router.push("/auth/sign-up")}
          >
            sign up
          </span>{" "}
          to create a new account.
        </div>
      </div>
    </div>
  );
};

export default page;
