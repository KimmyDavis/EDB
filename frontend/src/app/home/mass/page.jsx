"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useDeleteMassMutation,
  useQueryMassQuery,
} from "@/features/mass/massApiSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/authClient";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import MassShare from "@/components/massComponents/MassShare";
import { canAccessRole } from "@/lib/roles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Mass = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const { data: authData } = authClient.useSession();
  const { user } = authData || {};
  const canManageMasses = canAccessRole(user?.role, "liturgy");

  const {
    data: massData,
    isLoading,
    isError,
    refetch,
  } = useQueryMassQuery({ id: "", date: "", title: "", code: "" });
  const masses = massData?.mass || massData || [];
  const [deleteMass] = useDeleteMassMutation();

  const filteredMasses = useMemo(() => {
    let list = [...masses];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((m) => m.title?.toLowerCase().includes(term));
    }
    list.sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(0);
      const db = b.date ? new Date(b.date) : new Date(0);
      return db - da;
    });
    return list;
  }, [masses, searchTerm]);

  const promptDelete = (id) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteMass({ id: pendingDeleteId }).unwrap();
      toast.success("Mass deleted");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete mass");
    } finally {
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="relative bg-theme-gold/90 min-h-screen p-6">
      <Image
        loading="eager"
        src="/images/backgrounds/grid-noise.png"
        width={500}
        height={500}
        alt="grid noise image background"
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      />

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Masses</h1>
              <p className="text-sm text-slate-700 mt-1">
                {canManageMasses
                  ? "Manage and preview all masses"
                  : "Browse available masses"}
              </p>
            </div>

            {canManageMasses && (
              <Button
                onClick={() => router.push("/home/mass/mass-editor/new")}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={18} />
                New Mass
              </Button>
            )}
          </div>

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md h-10 shadow-sm"
            />
          </div>
        </div>

        {isLoading && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-[#fff5] animate-pulse">
                  <CardHeader className="h-20 bg-gray-300 rounded-t" />
                  <CardContent className="space-y-3 mt-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isError && (
          <div className="max-w-6xl mx-auto">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-800">Error loading masses.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && !isError && filteredMasses.length === 0 && (
          <div className="max-w-6xl mx-auto">
            <Card className="bg-[#fff5] text-center py-12">
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {canManageMasses ? "No masses found" : "No masses available"}
                </p>
                {canManageMasses && (
                  <Button
                    onClick={() => router.push("/home/mass/mass-editor/new")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add your first mass
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete mass?</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this mass? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!isLoading && !isError && filteredMasses.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMasses.map((mass) => {
                const theDate = mass?.date
                  ? new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                    }).format(new Date(mass.date))
                  : "No date";

                return (
                  <Card
                    key={mass._id}
                    className="bg-[#fff5] flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-bold text-slate-900 truncate">
                        {mass.title}
                      </h3>
                      <p className="text-xs text-slate-700 mt-1">{theDate}</p>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <div className="flex flex-col items-start justify-between gap-0">
                          <p className="text-xs font-semibold text-slate-700">
                            Code
                          </p>
                          <p className="text-sm text-slate-800 font-mono truncate mt-1">
                            {mass.code}
                          </p>
                        </div>
                        <MassShare
                          massId={mass._id}
                          className="bg-theme-cream self-end"
                        />
                      </div>
                    </CardContent>

                    <CardFooter className="gap-2 justify-end mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/home/mass/" + mass._id)}
                        className="flex items-center gap-1"
                      >
                        <Eye size={16} /> Preview
                      </Button>

                      {canManageMasses && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push("/home/mass/mass-editor/" + mass._id)
                            }
                            className="flex items-center gap-1"
                          >
                            <Edit size={16} /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => promptDelete(mass._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                          >
                            <Trash2 size={16} /> Delete
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mass;
