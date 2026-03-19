"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, ShieldAlert, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_OPTIONS = ["admin", "user", "liturgy", "media"];

const getRole = (user) => {
  const roleValue = user?.role;
  if (Array.isArray(roleValue)) return roleValue[0] || "user";
  if (typeof roleValue === "string") return roleValue.split(",")[0] || "user";
  return "user";
};

const countRoles = (users, targetUserId, targetRole) => {
  let adminCount = 0;
  let elevatedCount = 0;

  for (const user of users || []) {
    const nextRole = user?.id === targetUserId ? targetRole : getRole(user);
    if (nextRole === "admin") adminCount += 1;
    if (nextRole !== "user") elevatedCount += 1;
  }

  return { adminCount, elevatedCount };
};

export default function AdminManageRoles({
  users,
  onUserUpdated,
  currentUserId,
}) {
  const [search, setSearch] = useState("");
  const [roleDrafts, setRoleDrafts] = useState({});
  const [updatingUserId, setUpdatingUserId] = useState("");

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const baseUsers = (users || []).filter(
      (user) => user?.id !== currentUserId,
    );
    if (!term) return baseUsers;

    return baseUsers.filter((user) => {
      const email = (user?.email || "").toLowerCase();
      const name = (user?.name || "").toLowerCase();
      const username = (user?.username || "").toLowerCase();
      return (
        email.includes(term) || name.includes(term) || username.includes(term)
      );
    });
  }, [users, search, currentUserId]);

  const handleRoleChange = (userId, role) => {
    setRoleDrafts((prev) => ({ ...prev, [userId]: role }));
  };

  const handleApplyRole = async (user) => {
    const userId = user?.id;
    const currentRole = getRole(user);
    const nextRole = roleDrafts[userId] || currentRole;

    if (nextRole === currentRole) {
      toast.info("This user already has that role.");
      return;
    }

    const { adminCount, elevatedCount } = countRoles(users, userId, nextRole);

    if (nextRole === "admin" && adminCount > 5) {
      toast.error("Admin role is limited to 5 users.");
      return;
    }

    if (nextRole !== "user" && elevatedCount > 15) {
      toast.error(
        "Non-user roles are limited to 15 total users (admin, liturgy, media).",
      );
      return;
    }

    try {
      setUpdatingUserId(userId);
      const { error } = await authClient.admin.setRole({
        userId,
        role: nextRole,
      });

      if (error) {
        toast.error(error.message || "Could not update role.");
        return;
      }

      onUserUpdated(userId, { role: nextRole });
      toast.success(`Role updated to ${nextRole}.`);
    } catch {
      toast.error("Something went wrong while updating the role.");
    } finally {
      setUpdatingUserId("");
    }
  };

  return (
    <Card className="bg-[#fff7] border-theme-gold/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-900">Manage user roles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-md border border-theme-gold/30 bg-white/60 p-3 text-xs text-slate-700">
          <p className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-theme-gold" />
            Max 5 admins. Total non-user roles (admin + liturgy + media) cannot
            exceed 15.
          </p>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, username, or email"
            className="max-w-md"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-700">
            <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-theme-gold" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const uid = user?.id;
              const isUpdating = updatingUserId === uid;
              const currentRole = getRole(user);
              const selectedRole = roleDrafts[uid] || currentRole;

              return (
                <div
                  key={uid}
                  className="flex flex-col gap-3 rounded-lg border border-theme-gold/25 bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.name || user?.username || "Unnamed user"}
                    </p>
                    <p className="mt-1 text-xs text-slate-700">{user?.email}</p>
                    <p className="mt-1 text-xs text-theme-gold capitalize">
                      Current role: {currentRole}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => handleRoleChange(uid, value)}
                    >
                      <SelectTrigger className="h-10 min-w-32 border-theme-gold/40 bg-white text-sm text-slate-900">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role} value={role}>
                            <span className="capitalize">{role}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      onClick={() => handleApplyRole(user)}
                      disabled={isUpdating}
                      className="bg-theme-gold hover:bg-theme-gold/90"
                    >
                      {isUpdating ? (
                        <span className="flex items-center gap-2">
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          Apply role
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
