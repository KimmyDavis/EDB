"use client";

import React, { use, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { authClient } from "@/lib/authClient";
import { eventsApiSlice } from "@/features/events/eventsApiSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DOWNLOAD_FIELDS = [
  { key: "name", label: "Name", required: true },
  { key: "course", label: "Course" },
  { key: "matricule", label: "Matricule" },
  { key: "passport", label: "Passport" },
  { key: "phone", label: "Phone Number" },
  { key: "email", label: "Email" },
  { key: "algerianId", label: "Algerian ID" },
];

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
  const router = useRouter();
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState(["name"]);

  const { data: authData, isPending: isAuthPending } = authClient.useSession();
  const { user } = authData || {};
  const isAdmin = user?.role === "admin";

  const {
    data: eventsResponse,
    isLoading,
    error,
  } = eventsApiSlice.useQueryEventsQuery({
    eventId,
    title: "",
    startDate: "",
    endDate: "",
    date: "",
    venue: "",
    code: "",
    theme: "",
    populateUsers: true,
  });

  const [downloadParticipantsPdf, { isLoading: isDownloading }] =
    eventsApiSlice.useDownloadEventParticipantsPdfMutation();

  const event = useMemo(() => {
    return eventsResponse?.events?.[0] || eventsResponse?.event || null;
  }, [eventsResponse]);

  const participants = useMemo(() => {
    const list = event?.participantsList || event?.participabtsList || [];
    return list.filter((p) => p && typeof p === "object");
  }, [event]);

  const handleFieldToggle = (fieldKey, required) => {
    if (required) return;
    setSelectedFields((prev) => {
      if (prev.includes(fieldKey)) {
        return prev.filter((field) => field !== fieldKey);
      }
      return [...prev, fieldKey];
    });
  };

  const handleDownload = async () => {
    try {
      const { fileUrl, fileName } = await downloadParticipantsPdf({
        eventId,
        fields: selectedFields,
      }).unwrap();

      if (!fileUrl) {
        throw new Error("Failed to generate download URL.");
      }

      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = fileName || "participants.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(fileUrl);

      setIsDownloadOpen(false);
      toast.success("Participants list downloaded.");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to download participants PDF.");
    }
  };

  if (isAuthPending || isLoading) {
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

  if (!isAdmin) {
    return (
      <div className="relative bg-theme-gold/90 min-h-screen p-6">
        <Image
          src="/images/backgrounds/fabric-of-squares.png"
          width={1000}
          height={1000}
          alt="square fabric image background"
          className="fixed top-0 left-0 w-full h-screen object-cover z-0"
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800">
                This page is restricted to administrators only.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/home/events")}
              >
                Back to Events
              </Button>
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

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Event Details</h1>
            <p className="text-sm text-slate-700 mt-1">
              View event information and participant data.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDownloadOpen(true)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              disabled={!event}
            >
              <Download size={16} />
              Download Participants
            </Button>
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
          <>
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
                    <p className="text-slate-800">
                      {formatDate(event.deadline)}
                    </p>
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
                    <p className="text-slate-800">{participants.length}</p>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="font-semibold text-slate-700">Description</p>
                    <p className="text-slate-800 mt-1">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#fff5] overflow-hidden">
              <CardHeader>
                <h3 className="text-lg font-bold text-slate-900">
                  Participants List
                </h3>
                <p className="text-sm text-slate-700">
                  Name, course, matricule, passport, phone, email and Algerian
                  ID.
                </p>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[920px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-700">
                        <th className="py-2 pr-3">Name</th>
                        <th className="py-2 pr-3">Course</th>
                        <th className="py-2 pr-3">Matricule</th>
                        <th className="py-2 pr-3">Passport</th>
                        <th className="py-2 pr-3">Phone</th>
                        <th className="py-2 pr-3">Email</th>
                        <th className="py-2 pr-3">Algerian ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant, index) => (
                        <tr
                          key={
                            participant._id ||
                            participant.id ||
                            participant.email ||
                            index
                          }
                          className="border-b border-slate-100 text-slate-800"
                        >
                          <td className="py-2 pr-3">
                            {participant.name || "-"}
                          </td>
                          <td className="py-2 pr-3">
                            {participant.course || "-"}
                          </td>
                          <td className="py-2 pr-3">
                            {participant.matricule || "-"}
                          </td>
                          <td className="py-2 pr-3">
                            {participant.passport || "-"}
                          </td>
                          <td className="py-2 pr-3">
                            {participant.phone || "-"}
                          </td>
                          <td className="py-2 pr-3">
                            {participant.email || "-"}
                          </td>
                          <td className="py-2 pr-3">
                            {participant.algerianId || "-"}
                          </td>
                        </tr>
                      ))}

                      {!participants.length && (
                        <tr>
                          <td className="py-4 text-slate-600" colSpan={7}>
                            No participants found for this event.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-slate-600">
                Total participants: {participants.length}
              </CardFooter>
            </Card>
          </>
        )}
      </div>

      <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Participants PDF</DialogTitle>
            <DialogDescription>
              Select the fields to include in the generated participants list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {DOWNLOAD_FIELDS.map((field) => {
              const checked = selectedFields.includes(field.key);
              return (
                <label
                  key={field.key}
                  className="flex items-center gap-2 text-sm text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={field.required}
                    onChange={() =>
                      handleFieldToggle(field.key, field.required)
                    }
                  />
                  <span>{field.label}</span>
                  {field.required && (
                    <span className="text-xs text-slate-500">(required)</span>
                  )}
                </label>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDownloadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading || !selectedFields.length}
            >
              {isDownloading ? "Generating..." : "Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailsPage;
