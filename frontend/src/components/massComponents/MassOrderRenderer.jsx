import React from "react";
import SongDisplay from "@/components/SongDisplay";
import PrayerCarousel from "@/components/massComponents/PrayerCarousel";
import GospelOfThePassionCard from "@/components/massComponents/GospelOfThePassionCard";
import { Badge } from "@/components/ui/badge";

const renderDetailValue = (value) => {
  if (value == null) return null;

  if (typeof value === "string") {
    return <p className="text-slate-800 whitespace-pre-line">{value}</p>;
  }

  return (
    <pre className="rounded-lg bg-white/70 p-3 text-xs text-slate-800 overflow-x-auto">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
};

const renderSectionTitle = (title = "") => {
  if (!title) return "Section";
  return title;
};

const shouldRenderNormalSection = (entry, mass) => {
  const field = entry?.massField;
  if (!field) return false;

  if (field === "gospelOfThePassion") {
    return (
      Array.isArray(mass?.gospelOfThePassion) &&
      mass.gospelOfThePassion.length > 0
    );
  }

  if (field === "psalmResponse") {
    return Boolean(mass?.psalmResponse);
  }

  const sectionData = mass?.[field];
  if (!sectionData || typeof sectionData !== "object") return false;
  if (sectionData?.included === false) return false;
  return Boolean(sectionData?.recited || sectionData?.songId);
};

const MassOrderRenderer = ({
  mass,
  fullOrderOfMass = [],
  detailedMode = false,
  prayers,
  selectedPrayerLanguage,
  prayerLanguages,
  onSelectPrayerLanguage,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {fullOrderOfMass.map((entry) => {
        const sectionKey = entry?.massField;
        const sectionTitle = renderSectionTitle(entry?.title);
        const sectionData = sectionKey ? mass?.[sectionKey] : null;
        const canShowNormal = shouldRenderNormalSection(entry, mass);

        if (!detailedMode && !canShowNormal) return null;

        if (sectionKey === "gospelOfThePassion" && canShowNormal) {
          return (
            <div key={entry.key} className="space-y-3">
              {detailedMode && (
                <section className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      {sectionTitle}
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-slate-300 bg-slate-100 text-slate-700"
                    >
                      reading
                    </Badge>
                  </div>
                  {renderDetailValue(entry?.detail)}
                </section>
              )}
              <GospelOfThePassionCard
                entries={mass?.gospelOfThePassion || []}
              />
            </div>
          );
        }

        if (sectionData?.recited) {
          const isPrayerSection =
            sectionKey === "creed" || sectionKey === "LordsPrayer";
          return (
            <section
              key={entry.key}
              className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {sectionTitle}
                </h3>
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-slate-100 text-slate-700"
                >
                  {entry?.kind || "section"}
                </Badge>
              </div>

              {isPrayerSection ? (
                <PrayerCarousel
                  prayerSet={prayers?.[sectionKey] || {}}
                  selectedLanguage={selectedPrayerLanguage}
                  languageOptions={prayerLanguages}
                  onSelectLanguage={onSelectPrayerLanguage}
                />
              ) : (
                <p className="mt-2 italic text-slate-700">To be recited.</p>
              )}

              {detailedMode && entry?.detail && (
                <div className="mt-4 border-t border-slate-200/70 pt-4">
                  {renderDetailValue(entry.detail)}
                </div>
              )}
            </section>
          );
        }

        if (sectionKey === "psalmResponse" && mass?.psalmResponse) {
          return (
            <section
              key={entry.key}
              className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {sectionTitle}
                </h3>
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-slate-100 text-slate-700"
                >
                  song
                </Badge>
              </div>
              <p className="text-slate-800 whitespace-pre-line">
                {mass.psalmResponse}
              </p>
              {detailedMode && entry?.detail && (
                <div className="mt-4 border-t border-slate-200/70 pt-4">
                  {renderDetailValue(entry.detail)}
                </div>
              )}
            </section>
          );
        }

        if (sectionData?.songId) {
          return (
            <section
              key={entry.key}
              className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {sectionTitle}
                </h3>
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-slate-100 text-slate-700"
                >
                  {entry?.kind || "song"}
                </Badge>
              </div>

              {typeof sectionData.songId === "object" ? (
                <SongDisplay song={sectionData.songId} partTitles={false} />
              ) : (
                <p className="text-sm text-slate-700 italic">
                  Song assigned for this section.
                </p>
              )}

              {detailedMode && entry?.detail && (
                <div className="mt-4 border-t border-slate-200/70 pt-4">
                  {renderDetailValue(entry.detail)}
                </div>
              )}
            </section>
          );
        }

        if (!canShowNormal && detailedMode && entry?.detail) {
          return (
            <section
              key={entry.key}
              className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {sectionTitle}
                </h3>
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-slate-100 text-slate-700"
                >
                  {entry?.kind || "rite"}
                </Badge>
              </div>
              {renderDetailValue(entry.detail)}
            </section>
          );
        }

        return null;
      })}
    </div>
  );
};

export default MassOrderRenderer;
