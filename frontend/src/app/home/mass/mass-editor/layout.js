"use client";

import RequireRole from "@/lib/RequireRole";

export default function MassEditorLayout({ children }) {
  return (
    <RequireRole
      requiredRole="liturgy"
      title="Restricted page"
      description="Only liturgy, or admin accounts can create or edit masses."
    >
      {children}
    </RequireRole>
  );
}
