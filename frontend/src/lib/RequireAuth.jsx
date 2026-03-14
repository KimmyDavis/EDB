"use client";
import { authClient } from "./authClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import usePublicRoute from "@/hooks/use-public-route";
import { hasRequiredProfileInfo } from "@/constants/required-profile-info";

export default function RequireAuth({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, error, isPending } = authClient.useSession();
  const { session, user } = data || {};

  const isLoginRoute = pathname === "/";
  const isPublicRoute = usePublicRoute();
  const isEditProfileRoute = pathname === "/auth/edit-profile";
  const sessionExpired = session
    ? Date.now() > new Date(session.expiresAt).getTime()
    : false;
  const hasActiveSession = !!session && !sessionExpired;
  const hasCompleteProfile = hasRequiredProfileInfo(user);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      if (!isPublicRoute) {
        router.replace("/");
      }
      return;
    }

    if (sessionExpired) {
      router.replace("/");
      return;
    }

    if (!hasCompleteProfile && !isEditProfileRoute) {
      toast.info("Your account is missing some crucial info.", {
        position: "top-center",
      });
      router.replace("/auth/edit-profile");
      return;
    }

    if (isLoginRoute) {
      router.replace("/home");
    }
  }, [
    isPending,
    session,
    sessionExpired,
    isLoginRoute,
    hasCompleteProfile,
    isPublicRoute,
    isEditProfileRoute,
    router,
  ]);

  const isRedirectingUnauthed = !isPending && !session && !isPublicRoute;
  const isRedirectingIncompleteProfile =
    !isPending && !!session && !hasCompleteProfile && !isEditProfileRoute;
  const isRedirectingAuthedLogin =
    !isPending && hasActiveSession && isLoginRoute;

  if (isPending) {
    return (
      <div className="pending bg-theme-cream flex flex-col items-center justify-center w-screen h-screen">
        <span className="loader from-css"></span>
        <span className="info">Authenticating...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error bg-theme-cream flex flex-col gap-2 items-center justify-center w-screen h-screen text-theme-gold">
        <p>Error! could not authenticate. Try to refresh.</p>
      </div>
    );
  }

  if (
    isRedirectingUnauthed ||
    isRedirectingIncompleteProfile ||
    isRedirectingAuthedLogin
  ) {
    return (
      <div className="pending bg-theme-cream flex flex-col items-center justify-center w-screen h-screen">
        <span className="loader from-css"></span>
        <span className="info">Redirecting...</span>
      </div>
    );
  }

  return <>{children}</>;
}
