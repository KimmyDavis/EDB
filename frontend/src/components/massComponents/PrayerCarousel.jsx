import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LANGUAGE_LABELS = {
  english: "English",
  french: "French",
  portuguese: "Portuguese",
};

const PrayerCarousel = ({
  prayerSet = {},
  selectedLanguage,
  languageOptions = [],
  onSelectLanguage,
}) => {
  const availableLanguages = Object.keys(prayerSet);

  if (!availableLanguages.length) return null;

  const activeLanguage = prayerSet[selectedLanguage]
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
          aria-label="Previous prayer language"
          className="rounded-md border border-slate-300 bg-white/70 p-1.5 text-slate-800 hover:bg-white"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
          {LANGUAGE_LABELS[activeLanguage] || activeLanguage}
        </span>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next prayer language"
          className="rounded-md border border-slate-300 bg-white/70 p-1.5 text-slate-800 hover:bg-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <p className="text-slate-800 whitespace-pre-line">{activePrayer}</p>
    </div>
  );
};

export default PrayerCarousel;
