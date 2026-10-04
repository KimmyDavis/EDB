"use client";
import SongDisplay from "@/components/SongDisplay";
import { useQueryMassQuery } from "@/features/mass/massApiSlice";
import { authClient } from "@/lib/authClient";
import { prayers } from "@/constants/prayers";
import { canAccessRole, LITURGY_ROLE } from "@/lib/roles";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { use, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Projector,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LANGUAGE_LABELS = {
  english: "English",
  french: "French",
  portuguese: "Portuguese",
};

const normalizeLanguage = (language) => {
  if (!language) return "english";
  const normalized = language.toLowerCase();
  if (normalized === "portugais") return "portuguese";
  if (normalized in LANGUAGE_LABELS) return normalized;
  return "english";
};

function PrayerCarousel({
  prayerKey,
  selectedLanguage,
  languageOptions,
  onSelectLanguage,
}) {
  const prayerSet = prayers?.[prayerKey] || {};
  const availableLanguages = Object.keys(prayerSet);

  if (!availableLanguages.length) return null;

  const selectedLabelLanguage = prayerSet[selectedLanguage]
    ? selectedLanguage
    : "english";
  const activePrayer = prayerSet[selectedLanguage] || prayerSet.english || "";

  const handlePrev = () => {
    const currentIndex = Math.max(languageOptions.indexOf(selectedLanguage), 0);
    const previousIndex =
      currentIndex === 0 ? languageOptions.length - 1 : currentIndex - 1;
    onSelectLanguage(languageOptions[previousIndex]);
  };

  const handleNext = () => {
    const currentIndex = Math.max(languageOptions.indexOf(selectedLanguage), 0);
    const nextIndex =
      currentIndex === languageOptions.length - 1 ? 0 : currentIndex + 1;
    onSelectLanguage(languageOptions[nextIndex]);
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous language"
          className="rounded-md border border-slate-300 bg-white/70 p-1.5 text-slate-800 hover:bg-white"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
          {LANGUAGE_LABELS[selectedLabelLanguage] || selectedLabelLanguage}
        </span>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next language"
          className="rounded-md border border-slate-300 bg-white/70 p-1.5 text-slate-800 hover:bg-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <p className="text-slate-800 whitespace-pre-line text-center">{activePrayer}</p>
    </div>
  );
}

const sectionOrder = [
  "entrance",
  "kyrie",
  "gloria",
  "psalmResponse",
  "acclamation",
  "gospelOfThePassion",
  "creed",
  "petition",
  "offertory",
  "sanctus",
  "LordsPrayer",
  "peace",
  "agnusDei",
  "holyCommunion",
  "thanksgiving",
  "exit",
];

const handleSectionName = (section) => {
  if (section === "psalmResponse") return "Psalm Response";
  if (section === "LordsPrayer") return "Lord's Prayer";
  if (section === "agnusDei") return "Agnus Dei";
  if (section === "holyCommunion") return "Holy Communion";
  if (section === "gospelOfThePassion") return "Gospel Of The Passion";
  return section;
};

const sectionHasContent = (mass, section) => {
  if (mass?.[section]?.included === false) return false;

  if (section === "gospelOfThePassion") {
    return (
      Array.isArray(mass?.gospelOfThePassion) &&
      mass.gospelOfThePassion.length > 0
    );
  }

  const sectionData = mass?.[section];

  if (section === "psalmResponse") return Boolean(mass?.psalmResponse);
  if (sectionData?.recited) return true;
  if (sectionData?.songId) return true;

  return false;
};

const ProjectorView = ({ params }) => {
  const { massCode } = use(params);
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const userRole = sessionData?.user?.role;
  const isAllowed = canAccessRole(userRole, LITURGY_ROLE);

  const preferredLanguage = useMemo(() => {
    return normalizeLanguage(sessionData?.user?.language);
  }, [sessionData?.user?.language]);

  const prayerLanguages = useMemo(() => {
    const available = new Set([
      ...Object.keys(prayers?.creed || {}),
      ...Object.keys(prayers?.LordsPrayer || {}),
    ]);
    const preferredOrder = ["english", "french", "portuguese", "arabe"];
    const resolved = preferredOrder.filter((lang) => available.has(lang));
    for (const lang of available) {
      if (!resolved.includes(lang)) resolved.push(lang);
    }
    return resolved.length ? resolved : ["english"];
  }, []);
  const [prayerLanguageOverride, setPrayerLanguageOverride] = useState(null);
  const selectedPrayerLanguage =
    prayerLanguageOverride ??
    (prayerLanguages.includes(preferredLanguage)
      ? preferredLanguage
      : "english");

  const [activeIndex, setActiveIndex] = useState(0);
  const [showTitleScreen, setShowTitleScreen] = useState(false);

  const {
    data: massData,
    isLoading,
    isError,
    error,
  } = useQueryMassQuery({ id: massCode }, { skip: !massCode });
  const mass = massData?.mass?.[0];

  const visibleSections = useMemo(() => {
    if (!mass) return [];
    return sectionOrder.filter((section) => sectionHasContent(mass, section));
  }, [mass]);

  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(visibleSections.length - 1, 0),
  );

  if (!isAllowed) {
    return (
      <div className="relative bg-theme-gold/90 min-h-screen">
        <Image
          loading="eager"
          src="/images/backgrounds/grid-noise.png"
          alt="grid noise image background"
          width={1200}
          height={1200}
          className="fixed top-0 left-0 w-full h-full object-cover z-0"
        />
        <main className="relative z-10 max-w-5xl mx-auto p-6">
          <div className="rounded-2xl border border-white/50 bg-[#fff6] p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Access restricted
            </h2>
            <p className="text-sm text-slate-700">
              Only liturgy roles and above can use the projector view.
            </p>
            <Button
              variant="outline"
              className="mt-4 bg-theme-cream border-theme-gold"
              onClick={() => router.push(`/home/mass/${massCode}`)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to mass
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const renderSingleSection = (section, key) => {
    if (section === "gospelOfThePassion") {
      return (
        <section
          key={key}
          className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
        >
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 capitalize mb-3">
            Gospel Of The Passion
          </h3>
          <div className="space-y-3">
            {mass.gospelOfThePassion.map((entry, idx) => (
              <div
                key={`passion-entry-${idx}`}
                className="rounded-lg border border-slate-200 bg-white/60 p-3 sm:p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-slate-200 text-slate-900"
                  >
                    {entry?.personality || "N"}
                  </Badge>
                  <span className="text-xs font-medium text-slate-600">
                    Part {idx + 1}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-800 whitespace-pre-line leading-relaxed">
                  {entry?.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    const sectionData = mass?.[section];
    const sectionTitle = handleSectionName(section);

    if (sectionData?.recited) {
      const isPrayerSection = section === "creed" || section === "LordsPrayer";
      return (
        <section
          key={key}
          className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
        >
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 capitalize mb-2">
            {sectionTitle}
          </h3>
          {isPrayerSection ? (
            <div className="text-2xl sm:text-3xl">
              <PrayerCarousel
                prayerKey={section}
                selectedLanguage={selectedPrayerLanguage}
                languageOptions={prayerLanguages}
                onSelectLanguage={setPrayerLanguageOverride}
              />
            </div>
          ) : (
            <p className="mt-2 italic text-slate-700 text-lg sm:text-xl">
              To be recited.
            </p>
          )}
        </section>
      );
    }

    if (section === "psalmResponse" && mass?.psalmResponse) {
      return (
        <section
          key={key}
          className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
        >
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">
            {sectionTitle}
          </h3>
          <p className="mt-2 text-slate-800 whitespace-pre-line text-lg sm:text-xl">
            {mass.psalmResponse}
          </p>
        </section>
      );
    }

    if (sectionData?.songId) {
      return (
        <section
          key={key}
          className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
        >
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 capitalize mb-2">
            {sectionTitle}
          </h3>
          {typeof sectionData.songId === "object" ? (
            <div className="text-lg sm:text-2xl">
              <SongDisplay
                song={sectionData.songId}
                partTitles={false}
                hideLinks
                centered
              />
            </div>
          ) : (
            <p className="text-sm text-slate-700 italic">
              Song assigned for this section.
            </p>
          )}
        </section>
      );
    }

    return null;
  };

  const activeSection = visibleSections[safeActiveIndex];
  const isFirst = safeActiveIndex === 0;
  const isLast = safeActiveIndex === visibleSections.length - 1;

  const goToPrevious = () => {
    setShowTitleScreen(false);
    setActiveIndex((i) => Math.max(0, i - 1));
  };

  const goToNext = () => {
    setShowTitleScreen(false);
    setActiveIndex((i) => Math.min(visibleSections.length - 1, i + 1));
  };

  return (
    <div className="relative bg-theme-gold/90 min-h-screen p-4 sm:p-6">
      <Image
        loading="eager"
        src="/images/backgrounds/grid-noise.png"
        alt="grid noise image background"
        width={1200}
        height={1200}
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      />

      <div className="sticky top-4 right-4 sm:top-6 sm:right-6 w-full z-30">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => router.push(`/home/mass/${massCode}`)}
          aria-label="Exit projector view"
          title="Exit projector view"
          className="bg-theme-cream border-theme-gold ml-auto flex items-center gap-1"
        >
          <Projector size={16} />
          <span className="sr-only">Exit projector view</span>
        </Button>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto pb-28 flex flex-col justify-center min-h-screen">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-2/3 bg-white/60 rounded-lg" />
            <div className="h-5 w-1/3 bg-white/50 rounded-lg" />
            <div className="grid gap-4 mt-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/50 bg-[#fff6] p-5 space-y-3"
                >
                  <div className="h-6 w-1/4 bg-slate-300/70 rounded" />
                  <div className="h-4 w-full bg-slate-300/60 rounded" />
                  <div className="h-4 w-11/12 bg-slate-300/60 rounded" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-700">Loading mass liturgy...</p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Could not load this mass
            </h2>
            <p className="text-sm text-red-800">
              {error?.data?.message ||
                "An unexpected error occurred while loading this mass."}
            </p>
          </div>
        ) : !mass ? (
          <div className="rounded-2xl border border-white/50 bg-[#fff6] p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Mass not found
            </h2>
            <p className="text-sm text-slate-700">
              No mass was found for this code. Please verify the link and try
              again.
            </p>
          </div>
        ) : showTitleScreen ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 text-center break-words leading-tight">
              {mass?.title}
            </h1>
          </div>
        ) : activeSection ? (
          <div className="mx-auto w-full max-w-3xl">
            {renderSingleSection(activeSection, activeSection)}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/50 bg-[#fff6] p-6 text-center">
            <p className="text-slate-700">
              This mass has no sections to display.
            </p>
          </div>
        )}
      </main>

      {mass && visibleSections.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/50 bg-[#fff6] p-2 shadow-md">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToPrevious}
              disabled={isFirst || showTitleScreen}
              aria-label="Previous section"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              onClick={() => setShowTitleScreen((v) => !v)}
              aria-pressed={showTitleScreen}
              aria-label="Toggle title screen"
              title="Toggle title screen"
              className={
                showTitleScreen
                  ? "rounded-full bg-theme-gold text-white"
                  : "rounded-full bg-white text-slate-900"
              }
            >
              <span className="text-base font-bold">T</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToNext}
              disabled={isLast || showTitleScreen}
              aria-label="Next section"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectorView;
