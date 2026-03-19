"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { eventsApiSlice } from "@/features/events/eventsApiSlice";
import { Trash2, Edit, Plus, Eye } from "lucide-react";
import { authClient } from "@/lib/authClient";
import { canAccessRole } from "@/lib/roles";

const EventsPage = () => {
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState("");

  // authentication & role
  const { data: authData } = authClient.useSession();
  const { user } = authData || {};
  const isAdmin = user?.role === "admin";
  const canManageEvents = canAccessRole(user?.role, "media");

  // join/leave mutation
  const [joinOrLeaveEvent] = eventsApiSlice.useJoinOrLeaveEventMutation();

  // Fetch all events (title param no longer used for filtering)
  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = eventsApiSlice.useQueryEventsQuery({
    eventId: "",
    title: "",
    startDate: "",
    endDate: "",
    date: "",
    venue: "",
    code: "",
    theme: "",
  });

  const [deleteEvent] = eventsApiSlice.useDeleteEventMutation();

  const userId = user?._id || user?.id;

  const events = eventsResponse?.events || eventsResponse || [];

  // client-side filtering and sorting
  const filteredEvents = React.useMemo(() => {
    let list = [...events];
    if (searchTitle) {
      const term = searchTitle.toLowerCase();
      list = list.filter((e) => e.title?.toLowerCase().includes(term));
    }
    // sort by date ascending, then by deadline if present
    list.sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(0);
      const db = b.date ? new Date(b.date) : new Date(0);
      if (da < db) return -1;
      if (da > db) return 1;
      // dates equal or missing, compare deadlines
      if (a.deadline && b.deadline) {
        const la = new Date(a.deadline);
        const lb = new Date(b.deadline);
        return la - lb;
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });
    return list;
  }, [events, searchTitle]);

  const isParticipant = (event) => {
    if (!userId) return false;
    // handle different structures
    const list =
      event.participants && Array.isArray(event.participants)
        ? event.participants
        : event.participants?.trype || [];
    return list.includes(userId);
  };

  const participantCount = (event) => {
    const list =
      event.participants && Array.isArray(event.participants)
        ? event.participants
        : event.participants?.trype || [];
    return list.length;
  };

  const canJoin = (event) => {
    const now = new Date();
    // check deadline
    if (event.deadline) {
      const dl = new Date(event.deadline);
      if (now > dl) return false;
    }
    // check event date expired
    if (event.date) {
      const ev = new Date(event.date);
      if (now > ev) return false;
    }
    // check capacity
    if (event.maxParticipants) {
      if (participantCount(event) >= event.maxParticipants) return false;
    }
    return true;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteEvent({ id }).unwrap();
      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error(
        error?.data?.message || "Failed to delete event. Please try again.",
      );
    }
  };

  const handleEdit = (id) => {
    router.push(`/home/events/create-event/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative bg-theme-gold/90 min-h-screen p-6">
      <Image
        src="/images/backgrounds/fabric-of-squares.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-0"
      />
      <div className="relative z-10">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">All Events</h1>
              <p className="text-sm text-slate-700 mt-1">
                {canManageEvents
                  ? "Manage and view all created events"
                  : "Browse and join available events"}
              </p>
            </div>
            {canManageEvents && (
              <Button
                onClick={() => router.push("/home/events/create-event/new")}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={18} />
                Create Event
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search events by title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="max-w-md h-10 shadow-sm"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-[#fff5] animate-pulse">
                  <CardHeader className="h-24 bg-gray-300 rounded-t"></CardHeader>
                  <CardContent className="space-y-3 mt-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-6xl mx-auto">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-800">
                  Error loading events. Please try again later.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && events.length === 0 && (
          <div className="max-w-6xl mx-auto">
            <Card className="bg-[#fff5] text-center py-12">
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {canManageEvents
                    ? "No events found"
                    : "No events available to join"}
                </p>
                {canManageEvents && (
                  <Button
                    onClick={() => router.push("/home/events/create-event")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Your First Event
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && !error && filteredEvents.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card
                  key={event._id || event.id}
                  className="bg-[#fff5] flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
                  style={{
                    borderTop: `4px solid ${event.theme || "#3b82f6"}`,
                  }}
                >
                  {/* Color Theme Bar */}
                  {/* <div
                    className="h-2"
                    style={{ backgroundColor: event.theme || "#3b82f6" }}
                  ></div> */}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">
                          {event.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          {event.venue}
                        </p>
                        {userId && (
                          <span
                            className={
                              "text-xs font-semibold mt-1 " +
                              (isParticipant(event)
                                ? "text-green-600"
                                : "text-slate-500")
                            }
                          >
                            {isParticipant(event)
                              ? "You are participating"
                              : "You are not participating"}
                          </span>
                        )}
                      </div>

                      {canManageEvents && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/home/events/${event._id || event.id}`)
                          }
                          className="shrink-0 flex items-center gap-1"
                        >
                          <Eye size={16} />
                          Details
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Date */}
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Event Date
                      </p>
                      <p className="text-sm text-slate-800">
                        {formatDate(event.date)}
                      </p>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Description
                        </p>
                        <p className="text-sm text-slate-800 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    )}

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      {event.fee && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Fee
                          </p>
                          <p className="text-sm text-slate-800">
                            {parseFloat(event.fee).toFixed(0)} DZ
                          </p>
                        </div>
                      )}
                      {event.maxParticipants && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Max Participants
                          </p>
                          <p className="text-sm text-slate-800">
                            {event.maxParticipants}
                          </p>
                        </div>
                      )}
                      {event.deadline && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Deadline
                          </p>
                          <p className="text-sm text-slate-800">
                            {formatDate(event.deadline)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="gap-2 w-full justify-end mt-auto">
                    {/* join / leave button for all users */}
                    {userId && (
                      <>
                        <Button
                          size="sm"
                          onClick={async () => {
                            const action = isParticipant(event)
                              ? "leave"
                              : "join";
                            // if trying to join but not allowed, do nothing
                            if (action === "join" && !canJoin(event)) {
                              toast.error("Cannot join this event");
                              return;
                            }
                            try {
                              await joinOrLeaveEvent({
                                eventId: event._id || event.id,
                                userId,
                                action,
                              }).unwrap();
                              toast.success(
                                action === "join"
                                  ? "Joined event"
                                  : "Left event",
                              );
                              refetch();
                            } catch (err) {
                              toast.error(
                                err?.data?.message ||
                                  "Unable to change participation",
                              );
                            }
                          }}
                          disabled={!isParticipant(event) && !canJoin(event)}
                          className={
                            isParticipant(event)
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }
                        >
                          {isParticipant(event) ? "Leave" : "Join"}
                        </Button>
                        {!isParticipant(event) && !canJoin(event) && (
                          <p className="text-xs text-red-500 mt-1">
                            Registration closed or full
                          </p>
                        )}
                      </>
                    )}

                    {/* admin controls */}
                    {canManageEvents && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(event._id || event.id)}
                          className="flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(event._id || event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
