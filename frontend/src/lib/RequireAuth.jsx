"use client";
import { authClient } from "./authClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function RequireAuth({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, error, isPending } = authClient.useSession();
  const { session, user } = data || {};
  const {
    phone,
    matricule,
    passport,
    algerianId,
    country,
    birthdate,
    course,
    language,
    gender,
  } = user || {};

  const isPublicRoute = pathname === "/" || pathname === "/auth/sign-up";
  const isEditProfileRoute = pathname === "/auth/edit-profile";
  const hasRequiredProfileInfo = [
    phone,
    matricule,
    passport,
    algerianId,
    country,
    birthdate,
    course,
    language,
    gender,
  ].every(Boolean);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      if (!isPublicRoute) {
        router.replace("/");
      }
      return;
    }

    const sessionExpired = Date.now() > new Date(session?.expiresAt).getTime();
    if (sessionExpired) {
      router.replace("/");
      return;
    }

    if (!hasRequiredProfileInfo && !isEditProfileRoute) {
      toast.info("Your account is missing some crucial info.", {
        position: "top-center",
      });
      router.replace("/auth/edit-profile");
    }
  }, [
    isPending,
    session,
    hasRequiredProfileInfo,
    isPublicRoute,
    isEditProfileRoute,
    router,
  ]);

  const isRedirectingUnauthed = !isPending && !session && !isPublicRoute;
  const isRedirectingIncompleteProfile =
    !isPending && !!session && !hasRequiredProfileInfo && !isEditProfileRoute;

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

  if (isRedirectingUnauthed || isRedirectingIncompleteProfile) {
    return (
      <div className="pending bg-theme-cream flex flex-col items-center justify-center w-screen h-screen">
        <span className="loader from-css"></span>
        <span className="info">Redirecting...</span>
      </div>
    );
  }

  return <>{children}</>;
}
