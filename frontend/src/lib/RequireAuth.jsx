"use client";
import { authClient } from "./authClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import usePublicRoute from "@/hooks/use-public-route";
import { hasRequiredProfileInfo } from "@/constants/required-profile-info";
import EmailVerification from "@/components/auth/emailVerification";

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
  const isEmailVerified = Boolean(user?.emailVerified);
  const isAccountVerified = Boolean(user?.verified);
  const hasCompleteProfile = hasRequiredProfileInfo(user);
  const needsEmailVerification =
    hasActiveSession && !isEmailVerified && !isPublicRoute;
  const needsAdminVerification =
    hasActiveSession && isEmailVerified && !isAccountVerified && !isPublicRoute;

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

    if (!isEmailVerified && isPublicRoute) {
      // Keep public routes usable for unverified users.
      return;
    }

    if (isEmailVerified && !isAccountVerified && isPublicRoute) {
      // Keep public routes usable for accounts pending admin approval.
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
    isEmailVerified,
    isAccountVerified,
    isLoginRoute,
    hasCompleteProfile,
    isPublicRoute,
    isEditProfileRoute,
    router,
  ]);

  const isRedirectingUnauthed = !isPending && !session && !isPublicRoute;
  const isRedirectingIncompleteProfile =
    !isPending &&
    !!session &&
    isEmailVerified &&
    isAccountVerified &&
    !hasCompleteProfile &&
    !isEditProfileRoute;
  const isRedirectingAuthedLogin =
    !isPending &&
    hasActiveSession &&
    isLoginRoute &&
    isEmailVerified &&
    isAccountVerified;

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

  if (needsEmailVerification) {
    return <EmailVerification email={user?.email || ""} />;
  }

  if (needsAdminVerification) {
    return (
      <div className="pending bg-theme-cream flex flex-col gap-2 items-center justify-center w-screen h-screen text-theme-gold px-4 text-center">
        <p className="text-xl font-semibold">Account verification pending</p>
        <p className="max-w-xl text-sm text-theme-gold/90">
          Your email is verified, but your account still needs admin approval.
          Please contact an admin member to verify your account. After they
          confirm your account, please log in again so your session updates.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 rounded-md bg-theme-gold px-4 py-2 text-sm font-medium text-white hover:bg-theme-gold/90"
        >
          Go to login
        </button>
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
