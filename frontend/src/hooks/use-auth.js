"use client";
import { authClient } from "@/lib/authClient";
import {
  ADMIN_ROLE,
  LITURGY_ROLE,
  MEDIA_ROLE,
  normalizeUserRole,
} from "@/lib/roles";

const EDITOR_ROLES = [ADMIN_ROLE, LITURGY_ROLE, MEDIA_ROLE];

const useAuth = () => {
  const { data, isPending } = authClient.useSession();
  const user = data?.user;
  const userRole = normalizeUserRole(user?.role);
  const isEditor = EDITOR_ROLES.includes(userRole);

  return {
    isEditor,
    isPending,
    user,
    role: userRole,
  };
};
export default useAuth;
