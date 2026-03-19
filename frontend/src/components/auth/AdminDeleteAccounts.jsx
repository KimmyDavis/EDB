"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const getUpdatedTime = (user) => {
  const date = user?.updatedAt ? new Date(user.updatedAt) : null;
  const time = date?.getTime?.() || NaN;
  return Number.isFinite(time) ? time : null;
};

const isDeletionEligible = (user) => {
  const updatedTime = getUpdatedTime(user);
  if (!updatedTime) return false;
  return Date.now() - updatedTime >= WEEK_IN_MS && !user?.emailVerified;
};

export default function AdminDeleteAccounts({
  users,
  currentUserId,
  onUserRemoved,
}) {
  const [search, setSearch] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);

  const deletableUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (users || []).filter(
      (user) => user?.id !== currentUserId && isDeletionEligible(user),
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
  }, [users, search, currentUserId]);

  const handleDelete = async (user) => {
    const userId = user?.id;

    try {
      setDeletingUserId(userId);
      const { error } = await authClient.admin.removeUser({ userId });

      if (error) {
        toast.error(error.message || "Could not delete this account.");
        return;
      }

      onUserRemoved(userId);
      toast.success("Account deleted successfully.");
      setConfirmUser(null);
    } catch {
      toast.error("Something went wrong while deleting this account.");
    } finally {
      setDeletingUserId("");
    }
  };

  return (
    <Card className="bg-[#fff7] border-theme-gold/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-900">
          Delete inactive accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-md border border-theme-gold/30 bg-white/60 p-3 text-xs text-slate-700">
          Accounts become eligible when they spend more than a week with an
          unverified email address.
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

        {deletableUsers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-700">
            <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-theme-gold" />
            <p>No accounts currently eligible for deletion.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deletableUsers.map((user) => {
              const uid = user?.id;
              const isDeleting = deletingUserId === uid;
              const updated = user?.updatedAt
                ? new Date(user.updatedAt).toLocaleString()
                : "Unknown";

              return (
                <div
                  key={uid}
                  className="flex flex-col gap-3 rounded-lg border border-theme-gold/25 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.name || user?.username || "Unnamed user"}
                    </p>
                    <p className="mt-1 text-xs text-slate-700">{user?.email}</p>
                    <p className="mt-1 text-xs text-theme-gold">
                      Last updated: {updated}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setConfirmUser(user)}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete account
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <Dialog
          open={!!confirmUser}
          onOpenChange={(open) => {
            if (!open && !deletingUserId) setConfirmUser(null);
          }}
        >
          <DialogContent className="bg-theme-cream border border-theme-gold/40">
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                Delete account permanently?
              </DialogTitle>
              <DialogDescription className="text-slate-700">
                This will permanently remove{" "}
                <span className="font-medium text-slate-900">
                  {confirmUser?.name ||
                    confirmUser?.username ||
                    confirmUser?.email ||
                    "this user"}
                </span>{" "}
                and all related access data. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="bg-transparent border-0 p-0 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmUser(null)}
                disabled={!!deletingUserId}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => confirmUser && handleDelete(confirmUser)}
                disabled={!!deletingUserId}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deletingUserId ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete account"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
