"use client";

export const sessionIsExpired = (session) =>
  Boolean(session) && Date.now() > new Date(session.expiresAt).getTime();

export const shouldRedirectToLogin = ({ isPending, session, isPublicRoute }) =>
  !isPending && !session && !isPublicRoute;

export const shouldRedirectToEditProfile = ({
  isPending,
  session,
  isEmailVerified,
  isAccountVerified,
  hasCompleteProfile,
  isEditProfileRoute,
  isPublicRoute,
}) =>
  !isPending &&
  Boolean(session) &&
  isEmailVerified &&
  isAccountVerified &&
  !hasCompleteProfile &&
  !isEditProfileRoute &&
  !isPublicRoute;

export const shouldRedirectToHome = ({
  isPending,
  hasActiveSession,
  isLoginRoute,
  isEmailVerified,
  isAccountVerified,
}) =>
  !isPending &&
  hasActiveSession &&
  isLoginRoute &&
  isEmailVerified &&
  isAccountVerified;
