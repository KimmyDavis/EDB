"use client";

import RequireRole from "@/lib/RequireRole";

export default function EventEditorLayout({ children }) {
  return (
    <RequireRole
      requiredRole="media"
      title="Restricted page"
      description="Only media, or admin accounts can create or edit events."
    >
      {children}
    </RequireRole>
  );
}
