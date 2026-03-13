"use client";
import SongDisplay from "@/components/SongDisplay";
import MassShare from "@/components/massComponents/MassShare";
import { useQueryMassQuery } from "@/features/mass/massApiSlice";
import Image from "next/image";
import React, { use } from "react";

const ShowMass = ({ params }) => {
  const { massCode } = use(params);
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
            return (
              <section
                key={section + "-recited-" + i}
                className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 capitalize">
                  {sectionTitle}
                </h3>
                <p className="mt-2 italic text-slate-700">To be recited.</p>
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
