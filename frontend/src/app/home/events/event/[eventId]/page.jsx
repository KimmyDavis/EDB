"use client";

import React, { use, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { eventsApiSlice } from "@/features/events/eventsApiSlice";
import { authClient } from "@/lib/authClient";
import { canAccessRole } from "@/lib/roles";
import { hasRequiredProfileInfo } from "@/constants/required-profile-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import EventShare from "@/components/eventsComponents/EventShare";

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

const EventDetailsPage = ({ params }) => {
  const { eventId } = use(params);

  // authentication & role
  const { data: authData } = authClient.useSession();
  const { user } = authData || {};
  const hasCompleteProfile = hasRequiredProfileInfo(user);

  // join/leave mutation
  const [joinOrLeaveEvent] = eventsApiSlice.useJoinOrLeaveEventMutation();

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = eventsApiSlice.useQueryEventsQuery({
    eventId,
    title: "",
    startDate: "",
    endDate: "",
    date: "",
    venue: "",
    code: "",
    theme: "",
  });

  const event = useMemo(() => {
    return eventsResponse?.events?.[0] || eventsResponse?.event || null;
  }, [eventsResponse]);

  const userId = user?._id || user?.id;

  const isParticipant = (event) => {
    if (!userId) return false;
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

    if (!hasCompleteProfile) return false;
    return true;
  };

  if (isLoading) {
    return (
      <div className="relative bg-theme-gold/90 min-h-screen p-6">
        <Image
          src="/images/backgrounds/fabric-of-squares.png"
          width={1000}
          height={1000}
          alt="square fabric image background"
          className="fixed top-0 left-0 w-full h-screen object-cover z-0"
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <Card className="bg-[#fff5] animate-pulse">
            <CardHeader className="h-16 bg-gray-300 rounded-t"></CardHeader>
            <CardContent className="space-y-3 mt-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-theme-gold/90 min-h-screen p-6">
      <Image
        src="/images/backgrounds/fabric-of-squares.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-0"
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Event Details</h1>
            <p className="text-sm text-slate-700 mt-1">
              View and join event information.
            </p>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800">
                Failed to load event details. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!error && !event && (
          <Card className="bg-[#fff5]">
            <CardContent className="pt-6 text-slate-700">
              Event not found.
            </CardContent>
          </Card>
        )}

        {event && (
          <Card className="bg-[#fff5]">
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900">
                {event.title}
              </h2>
              <p className="text-sm text-slate-600">{event.venue || "N/A"}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-700">Event Date</p>
                  <p className="text-slate-800">{formatDate(event.date)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Deadline</p>
                  <p className="text-slate-800">{formatDate(event.deadline)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Fee</p>
                  <p className="text-slate-800">
                    {event.fee
                      ? `${parseFloat(event.fee).toFixed(0)} DZ`
                      : "Free"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Participants</p>
                  <p className="text-slate-800">{participantCount(event)}</p>
                </div>
              </div>

              {event.description && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-700">Description</p>
                  <p className="text-slate-800 mt-1">{event.description}</p>
                </div>
              )}

              {event.maxParticipants && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-700">Capacity</p>
                  <p className="text-slate-800">
                    {participantCount(event)} / {event.maxParticipants}
                  </p>
                </div>
              )}
            </CardContent>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-2 flex-wrap">
              {userId && (
                <>
                  <Button
                    onClick={async () => {
                      const action = isParticipant(event) ? "leave" : "join";
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
                          action === "join" ? "Joined event" : "Left event",
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
                    {isParticipant(event) ? "Leave Event" : "Join Event"}
                  </Button>
                  {!isParticipant(event) && !canJoin(event) && (
                    <p className="text-sm text-red-600 flex items-center">
                      Registration closed or full
                    </p>
                  )}
                </>
              )}
              <EventShare eventId={event._id || event.id} className="ml-auto" />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;
