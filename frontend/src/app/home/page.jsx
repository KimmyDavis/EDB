"use client";
import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Music, Calendar, MapPin, Clock, AlertCircle, Eye } from "lucide-react";
import { useQueryMassQuery } from "@/features/mass/massApiSlice";
import { useQueryEventsQuery } from "@/features/events/eventsApiSlice";
import MassShare from "@/components/massComponents/MassShare";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  // Fetch masses and events
  const {
    data: massData,
    isLoading: isMassLoading,
    isError: isMassError,
  } = useQueryMassQuery({});
  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error,
  } = useQueryEventsQuery({});
  let massesList = massData?.mass;
  let eventsList = eventsData?.events;

  const masses = useMemo(() => massesList || [], [massesList]);
  const events = useMemo(() => eventsList || [], [eventsList]);

  // Get current date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the most recent mass whose date hasn't been exceeded
  const currentMass = useMemo(() => {
    const massesSorted = [...masses].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    return massesSorted.find((mass) => new Date(mass.date) >= today) || null;
  }, [masses]);

  // Find the previous most recent mass (before current)
  const previousMass = useMemo(() => {
    const massesSorted = [...masses].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    const currentIndex = massesSorted.findIndex(
      (m) => m._id === currentMass?._id,
    );
    return currentIndex >= 0 && currentIndex + 1 < massesSorted.length
      ? massesSorted[currentIndex + 1]
      : massesSorted[0];
  }, [masses, currentMass]);

  // Get top 3 upcoming events sorted by date, then deadline
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const futureEvents = events
      ?.filter((event) => new Date(event.date) > now)
      ?.sort((a, b) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        if (aDate.getTime() !== bDate.getTime()) {
          return aDate - bDate;
        }
        // If same date, sort by deadline
        const aDeadline = new Date(a.deadline || a.date);
        const bDeadline = new Date(b.deadline || b.date);
        return aDeadline - bDeadline;
      });

    return futureEvents.slice(0, 3);
  }, [events]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardHoverVariants = {
    idle: { y: 0 },
    hover: {
      y: -4,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const getMassRoute = (mass) => `/home/mass/${mass?._id || mass?.code || ""}`;

  return (
    <motion.div
      className="home relative bg-theme-gold w-full min-h-screen px-4 py-8 md:px-8 md:py-12"
      style={{
        background:
          "linear-gradient(135deg, rgba(217,119,6,0.05) 0%, rgba(217,119,6,0.02) 100%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src="/images/backgrounds/groovepaper.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <Music className="w-8 h-8 text-theme-gold" />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Dashboard
          </h1>
        </motion.div>

        {/* Recent Masses Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Current Mass */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-theme-gold" />
              Current Mass
            </h2>
            {isMassLoading ? (
              <Card className="bg-[#fff5] border-slate-200/50 p-6">
                <Skeleton className="h-32" />
              </Card>
            ) : isMassError ? (
              <Card className="bg-red-50/50 border-red-200 p-6">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">Error loading masses</p>
                </div>
              </Card>
            ) : currentMass ? (
              <motion.div
                variants={cardHoverVariants}
                initial="idle"
                whileHover="hover"
              >
                <Card className="bg-[#fff5] border-theme-gold/30 hover:border-theme-gold/60 hover:shadow-lg transition-all p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-semibold text-theme-gold uppercase tracking-wider">
                        {formatDate(currentMass.date)}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {currentMass.title}
                      </h3>
                    </div>
                    <MassShare massId={currentMass._id} iconOnly={true} />
                  </div>

                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Code2Icon className="w-4 h-4 text-theme-gold/70" />
                      <span className="font-mono text-xs">
                        {currentMass.code}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-theme-gold hover:bg-theme-gold/90 text-white"
                    >
                      <Link
                        href={getMassRoute(currentMass)}
                        className="flex flex-row gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Link>
                    </Button>
                  </div>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-4 h-0.5 bg-linear-to-r from-theme-gold/20 to-transparent origin-left"
                  />
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-slate-50/50 border-slate-200 p-6">
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    No upcoming masses scheduled
                  </p>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Previous Mass */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              Previous Mass
            </h2>
            {isMassLoading ? (
              <Card className="bg-[#fff5] border-slate-200/50 p-6">
                <Skeleton className="h-32" />
              </Card>
            ) : isMassError ? (
              <Card className="bg-red-50/50 border-red-200 p-6">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">Error loading masses</p>
                </div>
              </Card>
            ) : previousMass ? (
              <motion.div
                variants={cardHoverVariants}
                initial="idle"
                whileHover="hover"
              >
                <Card className="bg-[#fff5] border-slate-200/50 hover:border-slate-300 hover:shadow-lg transition-all p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {formatDate(previousMass.date)}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {previousMass.title}
                      </h3>
                    </div>
                    <MassShare massId={previousMass._id} iconOnly={true} />
                  </div>

                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Code2Icon className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-xs">
                        {previousMass.code}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-theme-gold/40 text-slate-800 hover:bg-theme-cream/40"
                    >
                      <Link
                        href={getMassRoute(previousMass)}
                        className="flex flex-row gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Link>
                    </Button>
                  </div>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-4 h-0.5 bg-linear-to-r from-slate-200/50 to-transparent origin-left"
                  />
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-slate-50/50 border-slate-200 p-6">
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    No previous mass available
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </motion.div>

        {/* Upcoming Events Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-theme-gold" />
            Upcoming Events
          </h2>

          {isEventsLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#fff5] border-slate-200/50 p-6">
                  <Skeleton className="h-24" />
                </Card>
              ))}
            </div>
          ) : isEventsError && error.status !== 404 ? (
            <Card className="bg-red-50/50 border-red-200 p-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Error loading events</p>
              </div>
            </Card>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-[#fff5] border-slate-200/50 hover:border-theme-gold/50 hover:shadow-lg transition-all p-5 h-full flex flex-col">
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-theme-gold uppercase tracking-wider">
                        {formatDate(event.date)}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-2">
                        {event.title}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 grow">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-theme-gold/70 shrink-0" />
                        <span>{formatDate(event.date)}</span>
                      </div>

                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-theme-gold/70 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      )}

                      {event.deadline && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
                          <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="text-orange-600 font-semibold">
                            Deadline: {formatDate(event.deadline)}
                          </span>
                        </div>
                      )}
                    </div>

                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                      className="mt-4 h-0.5 bg-linear-to-r from-theme-gold/20 to-transparent origin-left"
                    />
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50/50 border-slate-200 p-6">
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-5 h-5" />
                <p className="text-sm font-medium">No upcoming events</p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Icon component for mass code
function Code2Icon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="M9.5 4h5" />
    </svg>
  );
}
