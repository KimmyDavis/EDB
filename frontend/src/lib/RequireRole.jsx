"use client";

import { authClient } from "./authClient";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { canAccessRole } from "@/lib/roles";

export default function RequireRole({
  children,
  requiredRole = "user",
  title = "Restricted page",
  description = "You do not have permission to view this page.",
}) {
  const router = useRouter();
  const { data, isPending, error } = authClient.useSession();
  const userRole = data?.user?.role;
  const hasAccess = canAccessRole(userRole, requiredRole);

  if (isPending) {
    return (
      <div className="pending bg-theme-cream flex flex-col items-center justify-center w-screen h-screen">
        <span className="loader from-css"></span>
        <span className="info">Checking permissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error bg-theme-cream flex flex-col gap-2 items-center justify-center w-screen h-screen text-theme-gold px-4 text-center">
        <p>Error! could not validate permissions. Try to refresh.</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="pending bg-theme-cream flex flex-col gap-3 items-center justify-center w-screen h-screen text-theme-gold px-4 text-center">
        <p className="text-xl font-semibold">{title}</p>
        <p className="max-w-xl text-sm text-theme-gold/90">{description}</p>
        <Button
          type="button"
          onClick={() => router.push("/home")}
          className="bg-theme-gold hover:bg-theme-gold/90 text-white"
        >
          Go to dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
