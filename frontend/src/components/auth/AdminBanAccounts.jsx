"use client";

import { useMemo, useState } from "react";
import { Ban, LoaderCircle, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const getRole = (user) => {
  const roleValue = user?.role;
  if (Array.isArray(roleValue)) return roleValue[0] || "user";
  if (typeof roleValue === "string") return roleValue.split(",")[0] || "user";
  return "user";
};

export default function AdminBanAccounts({ users, onUserUpdated }) {
  const [search, setSearch] = useState("");
  const [banReasonByUser, setBanReasonByUser] = useState({});
  const [banningUserId, setBanningUserId] = useState("");
  const [unbanningUserId, setUnbanningUserId] = useState("");

  const bannableUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (users || []).filter(
      (user) => getRole(user) === "user" && !user?.banned,
    );
    if (!term) return list;

    return list.filter((user) => {
      const email = (user?.email || "").toLowerCase();
      const name = (user?.name || "").toLowerCase();
      const username = (user?.username || "").toLowerCase();
      return (
        email.includes(term) || name.includes(term) || username.includes(term)
      );
    });
  }, [users, search]);

  const bannedUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (users || []).filter((user) => !!user?.banned);
    if (!term) return list;

    return list.filter((user) => {
      const email = (user?.email || "").toLowerCase();
      const name = (user?.name || "").toLowerCase();
      const username = (user?.username || "").toLowerCase();
      return (
        email.includes(term) || name.includes(term) || username.includes(term)
      );
    });
  }, [users, search]);

  const handleBan = async (userId) => {
    try {
      setBanningUserId(userId);
      const reason = (banReasonByUser[userId] || "").trim();
      const { error } = await authClient.admin.banUser({
        userId,
        ...(reason ? { banReason: reason } : {}),
      });

      if (error) {
        toast.error(error.message || "Could not ban this user.");
        return;
      }

      onUserUpdated(userId, {
        banned: true,
        banReason: reason || "No reason",
      });
      toast.success("User account has been banned.");
    } catch {
      toast.error("Something went wrong while banning this account.");
    } finally {
      setBanningUserId("");
    }
  };

  const handleUnban = async (userId) => {
    try {
      setUnbanningUserId(userId);
      const { error } = await authClient.admin.unbanUser({ userId });

      if (error) {
        toast.error(error.message || "Could not unban this user.");
        return;
      }

      onUserUpdated(userId, {
        banned: false,
        banReason: null,
        banExpires: null,
      });
      toast.success("User account has been unbanned.");
    } catch {
      toast.error("Something went wrong while unbanning this account.");
    } finally {
      setUnbanningUserId("");
    }
  };

  return (
    <Card className="bg-[#fff7] border-theme-gold/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-900">Ban user accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user accounts by name, username, or email"
            className="max-w-md"
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">
              Active user accounts
            </p>
            {bannableUsers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-700">
                <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-theme-gold" />
                <p>No bannable user-role accounts found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bannableUsers.map((user) => {
                  const uid = user?.id;
                  const isBanning = banningUserId === uid;
                  return (
                    <div
                      key={uid}
                      className="flex flex-col gap-3 rounded-lg border border-theme-gold/25 bg-white/70 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {user?.name || user?.username || "Unnamed user"}
                        </p>
                        <p className="mt-1 text-xs text-slate-700">
                          {user?.email}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          type="text"
                          value={banReasonByUser[uid] || ""}
                          onChange={(event) =>
                            setBanReasonByUser((prev) => ({
                              ...prev,
                              [uid]: event.target.value,
                            }))
                          }
                          placeholder="Optional ban reason"
                          className="sm:max-w-sm"
                        />
                        <Button
                          type="button"
                          onClick={() => handleBan(uid)}
                          disabled={isBanning}
                          className="bg-theme-gold hover:bg-theme-gold/90"
                        >
                          {isBanning ? (
                            <span className="flex items-center gap-2">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              Banning...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Ban className="h-4 w-4" />
                              Ban account
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">
              Banned accounts
            </p>
            {bannedUsers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-700">
                <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-theme-gold" />
                <p>No banned accounts found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bannedUsers.map((user) => {
                  const uid = user?.id;
                  const isUnbanning = unbanningUserId === uid;

                  return (
                    <div
                      key={uid}
                      className="flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {user?.name || user?.username || "Unnamed user"}
                        </p>
                        <p className="mt-1 text-xs text-slate-700">
                          {user?.email}
                        </p>
                        {user?.banReason && (
                          <p className="mt-1 text-xs text-red-700">
                            Reason: {user.banReason}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleUnban(uid)}
                        disabled={isUnbanning}
                        className="bg-slate-800 hover:bg-slate-900 text-white"
                      >
                        {isUnbanning ? (
                          <span className="flex items-center gap-2">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Unbanning...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ShieldX className="h-4 w-4" />
                            Unban account
                          </span>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
