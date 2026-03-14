"use client";
import SongDisplay from "@/components/SongDisplay";
import MassShare from "@/components/massComponents/MassShare";
import { useQueryMassQuery } from "@/features/mass/massApiSlice";
import { authClient } from "@/lib/authClient";
import { prayers } from "@/constants/prayers";
import Image from "next/image";
import React, { use, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

      <p className="text-slate-800 whitespace-pre-line">{activePrayer}</p>
    </div>
  );
}

const ShowMass = ({ params }) => {
  const { massCode } = use(params);
  const { data: sessionData } = authClient.useSession();
  const preferredLanguage = useMemo(() => {
    const normalized = normalizeLanguage(sessionData?.user?.language);
    return normalized;
  }, [sessionData?.user?.language]);
  const prayerLanguages = useMemo(() => {
    const available = new Set([
      ...Object.keys(prayers?.creed || {}),
      ...Object.keys(prayers?.LordsPrayer || {}),
    ]);
    const ordered = ["english", "french", "portuguese"];
    const resolved = ordered.filter((lang) => available.has(lang));
    return resolved.length ? resolved : ["english"];
  }, []);
  const [selectedPrayerLanguage, setSelectedPrayerLanguage] = useState(
    prayerLanguages.includes(preferredLanguage) ? preferredLanguage : "english",
  );

  useEffect(() => {
    setSelectedPrayerLanguage(
      prayerLanguages.includes(preferredLanguage)
        ? preferredLanguage
        : "english",
    );
  }, [preferredLanguage, prayerLanguages]);

  const {
    data: massData,
    isLoading,
    isError,
    error,
  } = useQueryMassQuery({ id: massCode }, { skip: !massCode });
  const mass = massData?.mass?.[0];

  const sectionOrder = [
    "entrance",
    "kyrie",
    "gloria",
    "psalmResponse",
    "acclamation",
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
    return section;
  };

  const pageShell = (content) => (
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
        <MassShare
          massId={mass?._id || massCode}
          iconOnly={true}
          className="bg-theme-cream border-theme-gold ml-auto"
        />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto pt-7 sm:pt-16">
        {content}
      </main>
    </div>
  );

  if (isLoading) {
    return pageShell(
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
      </div>,
    );
  }

  if (isError) {
    return pageShell(
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-2">
          Could not load this mass
        </h2>
        <p className="text-sm text-red-800">
          {error?.data?.message ||
            "An unexpected error occurred while loading this mass."}
        </p>
      </div>,
    );
  }

  if (!mass) {
    return pageShell(
      <div className="rounded-2xl border border-white/50 bg-[#fff6] p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Mass not found
        </h2>
        <p className="text-sm text-slate-700">
          No mass was found for this code. Please verify the link and try again.
        </p>
      </div>,
    );
  }

  const massDate = mass?.date
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
        new Date(mass.date),
      )
    : null;

  return pageShell(
    <>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          {mass?.title}
        </h1>
        {massDate && <p className="text-sm text-slate-700 mt-2">{massDate}</p>}
      </header>

      <div className="space-y-4 sm:space-y-5">
        {sectionOrder?.map((section, i) => {
          if (mass?.[section]?.included === false) return null;

          const sectionData = mass?.[section];
          const sectionTitle = handleSectionName(section);

          if (sectionData?.recited) {
            const isPrayerSection =
              section === "creed" || section === "LordsPrayer";
            return (
              <section
                key={section + "-recited-" + i}
                className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 capitalize">
                  {sectionTitle}
                </h3>
                {isPrayerSection ? (
                  <PrayerCarousel
                    prayerKey={section}
                    selectedLanguage={selectedPrayerLanguage}
                    languageOptions={prayerLanguages}
                    onSelectLanguage={setSelectedPrayerLanguage}
                  />
                ) : (
                  <p className="mt-2 italic text-slate-700">To be recited.</p>
                )}
              </section>
            );
          }

          if (section === "psalmResponse" && mass?.psalmResponse) {
            return (
              <section
                key={section + "-psalm-" + i}
                className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {sectionTitle}
                </h3>
                <p className="mt-2 text-slate-800 whitespace-pre-line">
                  {mass.psalmResponse}
                </p>
              </section>
            );
          }

          if (sectionData?.songId) {
            return (
              <section
                key={section + "-song-" + i}
                className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 capitalize mb-2">
                  {sectionTitle}
                </h3>
                {typeof sectionData.songId === "object" ? (
                  <SongDisplay song={sectionData.songId} partTitles={false} />
                ) : (
                  <p className="text-sm text-slate-700 italic">
                    Song assigned for this section.
                  </p>
                )}
              </section>
            );
          }

          return null;
        })}
      </div>

      <p className="text-center italic text-slate-700 mt-8 sm:mt-10">
        Have a blessed week.
      </p>
    </>,
  );
};

export default ShowMass;
