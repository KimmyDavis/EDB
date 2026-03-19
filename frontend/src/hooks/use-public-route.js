"use client";

import { usePathname } from "next/navigation";

export function isPublicRoutePath(pathname = "") {
  return (
    pathname === "/" ||
    pathname === "/auth/sign-up" ||
    pathname === "/auth/forgot-password" ||
    /^\/home\/mass\/[^/]+\/?$/.test(pathname)
  );
}

export default function usePublicRoute() {
  const pathname = usePathname();
  return isPublicRoutePath(pathname);
}
