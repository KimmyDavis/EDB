"use client";

import RequireRole from "@/lib/RequireRole";

export default function AdminActionsLayout({ children }) {
  return (
    <RequireRole
      requiredRole="admin"
      title="Restricted page"
      description="Only administrators can access admin actions."
    >
      {children}
    </RequireRole>
  );
}
