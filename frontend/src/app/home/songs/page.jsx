"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import { Edit, Trash2, Eye } from "lucide-react";
import { songsApiSlice } from "@/features/songs/songsApiSlice";
import { authClient } from "@/lib/authClient";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const Songs = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // auth
  const { data: authData } = authClient.useSession();
  const { user } = authData || {};
  const isAdmin = user?.role === "admin";

  // api hooks
  const {
    data: songsResponse,
    isLoading,
    error,
    refetch,
  } = songsApiSlice.useQuerySongsQuery({
    id: "",
    service: "",
    section: "",
    category: "",
    title: "",
    code: "",
  });

  const [deleteSong] = songsApiSlice.useDeleteSongMutation();

  const songs = songsResponse?.songs || songsResponse || [];

  const filteredSongs = useMemo(() => {
    let list = [...songs];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((s) => {
        const titleMatch = s.title?.toLowerCase().includes(term);
        const catMatch = s.category?.toLowerCase().includes(term);
        const secMatch = Array.isArray(s.sections)
          ? s.sections.some((sec) => sec.toLowerCase().includes(term))
          : false;
        return titleMatch || catMatch || secMatch;
      });
    }
    // sort by createdAt descending (newest first)
    list.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db - da;
    });
    return list;
  }, [songs, searchTerm]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteSong({ id: pendingDeleteId }).unwrap();
      toast.success("Song deleted");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete song");
    } finally {
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  const promptDelete = (id) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="relative bg-theme-gold/90 min-h-screen p-6">
      <Image
        loading="eager"
        src="/images/backgrounds/debut-light.png"
        width={500}
        height={500}
        alt="square fabric image background"
        className="fixed top-0 left-0 w-full object-cover z-0"
      />
      <div className="relative z-10">
        {/* header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Songs</h1>
              <p className="text-sm text-slate-700 mt-1">
                {isAdmin
                  ? "Manage and view all songs"
                  : "Browse available songs"}
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => router.push("/home/songs/song-editor/new")}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={18} />
                New Song
              </Button>
            )}
          </div>

          {/* search */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by title, category or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md h-10 shadow-sm"
            />
          </div>
        </div>

        {/* states */}
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
        {error && (
          <div className="max-w-6xl mx-auto">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-800">Error loading songs.</p>
              </CardContent>
            </Card>
          </div>
        )}
        {!isLoading && !error && filteredSongs.length === 0 && (
          <div className="max-w-6xl mx-auto">
            <Card className="bg-[#fff5] text-center py-12">
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {isAdmin ? "No songs found" : "No songs available"}
                </p>
                {isAdmin && (
                  <Button
                    onClick={() => router.push("/home/songs/song-editor/new")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add your first song
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete song?</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this song? This
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

        {/* list */}
        {!isLoading && !error && filteredSongs.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSongs.map((song) => {
                return (
                  <Card
                    key={song._id}
                    className="bg-[#fff5] flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-bold text-slate-900 truncate">
                        {song.title}
                      </h3>
                      <div className="text-xs text-slate-600 mt-1">
                        {song.service === "catholic" ? (
                          <div className="flex flex-row gap-1">
                            {song.sections?.map((sect, i) => (
                              <span key={i} className="text-xs text-slate-700">
                                {sect}
                              </span>
                            ))}
                          </div>
                        ) : (
                          song.category
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Added
                        </p>
                        <p className="text-sm text-slate-800">
                          {new Date(song.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2 justify-end mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/home/songs/" + song.code)}
                        className="flex items-center gap-1"
                      >
                        <Eye size={16} /> Preview
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push("/home/songs/song-editor/" + song._id)
                            }
                            className="flex items-center gap-1"
                          >
                            <Edit size={16} /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => promptDelete(song._id)}
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

export default Songs;
