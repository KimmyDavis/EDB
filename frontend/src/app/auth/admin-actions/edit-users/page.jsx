"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  username: "",
  phone: "",
  matricule: "",
  passport: "",
  algerianId: "",
  country: "",
  birthdate: "",
  course: "",
  language: "",
  gender: "",
  verified: false,
  left: false,
  deleted: false,
};

export default function EditUsersPage() {
  const router = useRouter();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const currentUser = sessionData?.user;
  const isAdmin = currentUser?.role === "admin";
  const isMobile = useIsMobile();

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
        toast.error(error.message || "Could not load users.");
        return;
      }

      setUsers(
        data?.users.filter((user) => user?.id !== currentUser?.id) || [],
      );
    } catch {
      toast.error("Something went wrong while loading users.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin, loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return (users || []).filter((user) => {
      const email = (user?.email || "").toLowerCase();
      const name = (user?.name || "").toLowerCase();
      const username = (user?.username || "").toLowerCase();
      return (
        email.includes(term) || name.includes(term) || username.includes(term)
      );
    });
  }, [users, search]);

  const selectedUser = useMemo(
    () => users.find((user) => user?.id === selectedUserId) || null,
    [users, selectedUserId],
  );

  useEffect(() => {
    if (!selectedUser) {
      setFormData(INITIAL_FORM_STATE);
      setIsFormDialogOpen(false);
      return;
    }

    setFormData({
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      username: selectedUser.username || "",
      phone: selectedUser.phone || "",
      matricule: selectedUser.matricule || "",
      passport: selectedUser.passport || "",
      algerianId: selectedUser.algerianId || "",
      country: selectedUser.country || "",
      birthdate: selectedUser.birthdate || "",
      course: selectedUser.course || "",
      language: selectedUser.language || "",
      gender: selectedUser.gender || "",
      verified: !!selectedUser.verified,
      left: !!selectedUser.left,
      deleted: !!selectedUser.deleted,
    });
  }, [selectedUser]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isMobile) {
      setIsFormDialogOpen(false);
    }
  }, [isMobile]);

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    if (isMobile) {
      setIsFormDialogOpen(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedUserId) {
      toast.error("Select a user to edit first.");
      return;
    }

    setIsSaving(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        username: formData.username.trim().replaceAll(" ", ""),
        phone: formData.phone,
        matricule: formData.matricule,
        passport: formData.passport,
        algerianId: formData.algerianId,
        country: formData.country,
        birthdate: formData.birthdate,
        course: formData.course,
        language: formData.language,
        gender: formData.gender,
        verified: formData.verified,
        left: formData.left,
        deleted: formData.deleted,
      };

      const { error } = await authClient.admin.updateUser({
        userId: selectedUserId,
        data: updateData,
      });

      if (error) {
        toast.error(error.message || "Could not update user.");
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user?.id === selectedUserId ? { ...user, ...updateData } : user,
        ),
      );
      toast.success("User updated successfully.");
    } catch {
      toast.error("Something went wrong while saving user data.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSessionPending) {
    return (
      <div className="bg-theme-cream flex min-h-screen items-center justify-center px-4 py-8">
        <LoaderCircle className="h-6 w-6 animate-spin text-theme-gold" />
        <span className="ml-3 text-slate-700">Checking permissions...</span>
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
              <p>Only administrators can access this page.</p>
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
    <div className="relative min-h-screen bg-theme-gold/90 p-2">
      <Image
        src="/images/backgrounds/fabric-of-squares.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 z-0 h-screen w-full object-cover"
      />
      <div className="relative z-10 mx-auto max-w-10xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit users</h1>
            <p className="mt-1 text-sm text-slate-700">
              Search users, select one, then update their profile information.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/auth/admin-actions")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              className="bg-theme-gold hover:bg-theme-gold/90"
              onClick={loadUsers}
              disabled={isLoadingUsers}
            >
              {isLoadingUsers ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Reload users
                </span>
              ) : (
                "Reload users"
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Card className="bg-[#fff7] border-theme-gold/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900">Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Search by name, username, or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full"
              />

              <div className="max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
                {filteredUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-700">
                    {isLoadingUsers
                      ? "Loading users..."
                      : "No users found with that search."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => {
                      const userId = user?.id;
                      const isSelected = userId === selectedUserId;
                      return (
                        <button
                          key={userId}
                          type="button"
                          onClick={() => handleSelectUser(userId)}
                          className={`relative w-full rounded-2xl border px-4 py-4 text-left transition-shadow hover:shadow-md ${
                            isSelected
                              ? "border-theme-gold bg-theme-gold/10"
                              : "border-slate-200 bg-white/80"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {user?.name || user?.username || "Unnamed user"}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {user?.email || "No email"}
                              </p>
                            </div>
                            <span className="rounded-full absolute top-1 right-1 bg-slate-100 px-2 py-1 text-xs text-slate-700">
                              {user?.role || "user"}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">
                            Created{" "}
                            {new Date(
                              user?.createdAt || Date.now(),
                            ).toLocaleDateString()}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hidden xl:block bg-[#fff7] border-theme-gold/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900">
                Edit selected user
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
                {!selectedUser ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-700">
                    <p className="font-semibold text-slate-900">
                      No user selected
                    </p>
                    <p className="mt-2 text-sm">
                      Pick a user from the list to edit their profile
                      information.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Name
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(event) =>
                            handleChange("name", event.target.value)
                          }
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Email
                        </label>
                        <Input
                          value={formData.email}
                          onChange={(event) =>
                            handleChange("email", event.target.value)
                          }
                          placeholder="Email address"
                          type="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Username
                        </label>
                        <Input
                          value={formData.username}
                          onChange={(event) =>
                            handleChange("username", event.target.value)
                          }
                          placeholder="Username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Phone
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(event) =>
                            handleChange("phone", event.target.value)
                          }
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Matricule
                        </label>
                        <Input
                          value={formData.matricule}
                          onChange={(event) =>
                            handleChange("matricule", event.target.value)
                          }
                          placeholder="Matricule"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Passport
                        </label>
                        <Input
                          value={formData.passport}
                          onChange={(event) =>
                            handleChange("passport", event.target.value)
                          }
                          placeholder="Passport number"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Algerian ID
                        </label>
                        <Input
                          value={formData.algerianId}
                          onChange={(event) =>
                            handleChange("algerianId", event.target.value)
                          }
                          placeholder="Algerian ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Country
                        </label>
                        <Input
                          value={formData.country}
                          onChange={(event) =>
                            handleChange("country", event.target.value)
                          }
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Birthdate
                        </label>
                        <Input
                          value={formData.birthdate}
                          onChange={(event) =>
                            handleChange("birthdate", event.target.value)
                          }
                          placeholder="dd/mm/yyyy"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Course
                        </label>
                        <Input
                          value={formData.course}
                          onChange={(event) =>
                            handleChange("course", event.target.value)
                          }
                          placeholder="Course"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Language
                        </label>
                        <Input
                          value={formData.language}
                          onChange={(event) =>
                            handleChange("language", event.target.value)
                          }
                          placeholder="Language"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Gender
                        </label>
                        <Select
                          disabled={true}
                          value={formData.gender}
                          onValueChange={(value) =>
                            handleChange("gender", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="m">Male</SelectItem>
                            <SelectItem value="f">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Verified
                        </label>
                        <Select
                          value={formData.verified ? "true" : "false"}
                          onValueChange={(value) =>
                            handleChange("verified", value === "true")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Verified" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Left
                        </label>
                        <Select
                          value={formData.left ? "true" : "false"}
                          onValueChange={(value) =>
                            handleChange("left", value === "true")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Left" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Deleted
                        </label>
                        <Select
                          value={formData.deleted ? "true" : "false"}
                          onValueChange={(value) =>
                            handleChange("deleted", value === "true")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Deleted" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedUserId("")}
                        className="w-full sm:w-auto"
                      >
                        Clear selection
                      </Button>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto bg-theme-gold hover:bg-theme-gold/90"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <SheetContent
          side="bottom"
          className="px-2 rounded-t-4xl mx-auto max-h-[85vh] overflow-y-auto pb-6"
        >
          <SheetHeader>
            <SheetTitle>Edit user</SheetTitle>
            <SheetDescription>
              Update profile information for the selected user.
            </SheetDescription>
          </SheetHeader>

          {!selectedUser ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-700">
              <p className="font-semibold text-slate-900">No user selected</p>
              <p className="mt-2 text-sm">Select a user from the list first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                    placeholder="Email address"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <Input
                    value={formData.username}
                    onChange={(event) =>
                      handleChange("username", event.target.value)
                    }
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Matricule
                  </label>
                  <Input
                    value={formData.matricule}
                    onChange={(event) =>
                      handleChange("matricule", event.target.value)
                    }
                    placeholder="Matricule"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Passport
                  </label>
                  <Input
                    value={formData.passport}
                    onChange={(event) =>
                      handleChange("passport", event.target.value)
                    }
                    placeholder="Passport number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Algerian ID
                  </label>
                  <Input
                    value={formData.algerianId}
                    onChange={(event) =>
                      handleChange("algerianId", event.target.value)
                    }
                    placeholder="Algerian ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Country
                  </label>
                  <Input
                    value={formData.country}
                    onChange={(event) =>
                      handleChange("country", event.target.value)
                    }
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Birthdate
                  </label>
                  <Input
                    value={formData.birthdate}
                    onChange={(event) =>
                      handleChange("birthdate", event.target.value)
                    }
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Course
                  </label>
                  <Input
                    value={formData.course}
                    onChange={(event) =>
                      handleChange("course", event.target.value)
                    }
                    placeholder="Course"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Language
                  </label>
                  <Input
                    value={formData.language}
                    onChange={(event) =>
                      handleChange("language", event.target.value)
                    }
                    placeholder="Language"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Gender
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Male</SelectItem>
                      <SelectItem value="f">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Verified
                  </label>
                  <Select
                    value={formData.verified ? "true" : "false"}
                    onValueChange={(value) =>
                      handleChange("verified", value === "true")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Verified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Left
                  </label>
                  <Select
                    value={formData.left ? "true" : "false"}
                    onValueChange={(value) =>
                      handleChange("left", value === "true")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Left" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Deleted
                  </label>
                  <Select
                    value={formData.deleted ? "true" : "false"}
                    onValueChange={(value) =>
                      handleChange("deleted", value === "true")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Deleted" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUserId("")}
                  className="w-full sm:w-auto"
                >
                  Clear selection
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-theme-gold hover:bg-theme-gold/90"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
