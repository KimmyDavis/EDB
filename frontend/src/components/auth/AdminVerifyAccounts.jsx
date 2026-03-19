"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminVerifyAccounts({ users, onUserUpdated }) {
  const [search, setSearch] = useState("");
  const [verifyingUserId, setVerifyingUserId] = useState("");

  const pendingUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (users || []).filter((user) => !user?.verified);
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

  const handleVerify = async (userId) => {
    try {
      setVerifyingUserId(userId);
      const { error } = await authClient.admin.updateUser({
        userId,
        data: { verified: true },
      });

      if (error) {
        toast.error(error.message || "Could not verify this account.");
        return;
      }

      onUserUpdated(userId, { verified: true });
      toast.success("Account verified successfully.");
    } catch {
      toast.error("Something went wrong while verifying this account.");
    } finally {
      setVerifyingUserId("");
    }
  };

  return (
    <Card className="bg-[#fff7] border-theme-gold/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-900">Verify user accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, username, or email"
            className="max-w-md"
          />
        </div>

        {pendingUsers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-700">
            <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-theme-gold" />
            <p>No pending accounts found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((user) => {
              const uid = user?.id;
              const isVerifying = verifyingUserId === uid;
              return (
                <div
                  key={uid}
                  className="flex flex-col gap-3 rounded-lg border border-theme-gold/25 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.name || user?.username || "Unnamed user"}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-700">
                      <Mail className="h-3.5 w-3.5" />
                      {user?.email || "No email"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleVerify(uid)}
                    disabled={isVerifying}
                    className="bg-theme-gold hover:bg-theme-gold/90"
                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Verify account
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
