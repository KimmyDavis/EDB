"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminVerifyAccounts from "@/components/auth/AdminVerifyAccounts";
import AdminManageRoles from "@/components/auth/AdminManageRoles";
import AdminBanAccounts from "@/components/auth/AdminBanAccounts";
import AdminDeleteAccounts from "@/components/auth/AdminDeleteAccounts";

const FEATURES = [
  { key: "verify", label: "Verify Accounts" },
  { key: "roles", label: "Manage Roles" },
  { key: "ban", label: "Ban Accounts" },
  { key: "delete", label: "Delete Accounts" },
];

export default function AdminActionsPage() {
  const router = useRouter();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeFeature, setActiveFeature] = useState("verify");

  const currentUser = sessionData?.user;
  const isAdmin = currentUser?.role === "admin";

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoadingUsers(true);
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: 300,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (error) {
        toast.error(error.message || "Could not load user accounts.");
        return;
      }

      const allUsers = data?.users || [];
      setUsers(allUsers);
    } catch {
      toast.error("Something went wrong while loading users.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isAdmin]);

  const patchUser = useCallback((userId, patch) => {
    setUsers((prev) =>
      prev.map((user) => (user?.id === userId ? { ...user, ...patch } : user)),
    );
  }, []);

  const removeUser = useCallback((userId) => {
    setUsers((prev) => prev.filter((user) => user?.id !== userId));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin, loadUsers]);

  if (isSessionPending) {
    return (
      <div className="pending bg-theme-cream flex flex-col items-center justify-center w-screen h-screen">
        <LoaderCircle className="h-6 w-6 animate-spin text-theme-gold" />
        <span className="info mt-2">Checking permissions...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen bg-theme-gold px-4 py-8">
        <Image
          src="/images/backgrounds/fabric-of-squares.png"
          width={1000}
          height={1000}
          alt="square fabric image background"
          className="fixed top-0 left-0 z-0 h-screen w-full object-cover"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Card className="bg-[#fff7] border-theme-gold/40">
            <CardHeader>
              <CardTitle className="text-slate-900">
                Access restricted
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-800">
              <p>Only administrators can approve user accounts.</p>
              <Button
                type="button"
                className="bg-theme-gold hover:bg-theme-gold/90"
                onClick={() => router.push("/home")}
              >
                Go to dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-theme-gold/90 p-6">
      <Image
        src="/images/backgrounds/fabric-of-squares.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 z-0 h-screen w-full object-cover"
      />

      <div className="relative z-10 mx-auto max-w-10xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Actions</h1>
            <p className="mt-1 text-sm text-slate-700">
              Manage account verification, roles, bans, and account deletion
              from one place.
            </p>
          </div>
          <Button
            type="button"
            onClick={loadUsers}
            disabled={isLoadingUsers}
            className="bg-theme-gold hover:bg-theme-gold/90"
          >
            {isLoadingUsers ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading users...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh users
              </span>
            )}
          </Button>
        </div>

        <Card className="bg-[#fff7] border-theme-gold/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900">Choose an action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <Button
                  key={feature.key}
                  type="button"
                  onClick={() => setActiveFeature(feature.key)}
                  className={`justify-start rounded-l-none w-max ${
                    activeFeature === feature.key
                      ? "bg-theme-gold text-white"
                      : "bg-theme-cream text-slate-900 hover:bg-theme-cream/80 border-theme-gold"
                  }`}
                >
                  {feature.label}
                </Button>
              ))}
            </div>

            {activeFeature === "verify" && (
              <AdminVerifyAccounts users={users} onUserUpdated={patchUser} />
            )}
            {activeFeature === "roles" && (
              <AdminManageRoles
                users={users}
                onUserUpdated={patchUser}
                currentUserId={currentUser?.id}
              />
            )}
            {activeFeature === "ban" && (
              <AdminBanAccounts users={users} onUserUpdated={patchUser} />
            )}
            {activeFeature === "delete" && (
              <AdminDeleteAccounts
                users={users}
                currentUserId={currentUser?.id}
                onUserRemoved={removeUser}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
