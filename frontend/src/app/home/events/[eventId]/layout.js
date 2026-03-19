"use client";

import RequireRole from "@/lib/RequireRole";

export default function EventDetailsLayout({ children }) {
  return (
    <RequireRole
      requiredRole="media"
      title="Restricted page"
      description="Only administrators can view event participant details."
    >
      {children}
    </RequireRole>
  );
}
