"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import MassShare from "@/components/massComponents/MassShare";
import MassOrderRenderer from "@/components/massComponents/MassOrderRenderer";
import { Button } from "@/components/ui/button";
import { prayers } from "@/constants/prayers";
import {
  useGetOrderOfMassQuery,
  useQueryMassQuery,
} from "@/features/mass/massApiSlice";

const LANGUAGE_LABELS = {
  english: "English",
  french: "French",
  portuguese: "Portuguese",
};

const normalizeMassLanguage = (language) => {
  if (!language) return "english";
  const normalized = String(language).toLowerCase();
  if (normalized === "portugais") return "portuguese";
  if (normalized in LANGUAGE_LABELS) return normalized;
  return "english";
};

const MassViewPage = ({ params }) => {
  const { massCode } = use(params);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [detailedMode, setDetailedMode] = useState(false);

  const {
    data: massData,
    isLoading: isMassLoading,
    isError: isMassError,
    error: massError,
  } = useQueryMassQuery({ code: massCode }, { skip: !massCode });

  const {
    data: orderPayload,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useGetOrderOfMassQuery();

  const mass = massData?.mass?.[0];

  const languageOptions = useMemo(() => {
    if (!orderPayload) return ["english"];
    const keys = Object.keys(orderPayload).filter(
      (key) => key !== "fullOrderOfMass",
    );
    return keys.length ? keys : ["english"];
  }, [orderPayload]);

  useEffect(() => {
    if (languageOptions.length && !languageOptions.includes(selectedLanguage)) {
      setSelectedLanguage(languageOptions[0]);
    }
  }, [languageOptions]);

  const selectedOrder = orderPayload?.[selectedLanguage] || null;
  const fullOrder = orderPayload?.fullOrderOfMass || [];

  const prayerLanguages = useMemo(() => {
    const available = new Set([
      ...Object.keys(prayers?.creed || {}),
      ...Object.keys(prayers?.LordsPrayer || {}),
    ]);
    const ordered = ["english", "french", "portuguese"];
    const resolved = ordered.filter((lang) => available.has(lang));
    return resolved.length ? resolved : ["english"];
  }, []);

  const [selectedPrayerLanguage, setSelectedPrayerLanguage] =
    useState("english");

  useEffect(() => {
    const preferredLanguage = normalizeMassLanguage(mass?.language);
    setSelectedPrayerLanguage(
      prayerLanguages.includes(preferredLanguage)
        ? preferredLanguage
        : "english",
    );
  }, [mass?.language, prayerLanguages]);

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

  if (isMassLoading || isOrderLoading) {
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

  if (isMassError || isOrderError) {
    return pageShell(
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-2">
          Could not load this mass view
        </h2>
        <p className="text-sm text-red-800">
          {massError?.data?.message ||
            orderError?.data?.message ||
            "An unexpected error occurred."}
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

      <section className="mb-4 sm:mb-5 rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={detailedMode ? "default" : "outline"}
            className={
              detailedMode ? "bg-theme-gold text-slate-900" : "bg-white/70"
            }
            onClick={() => setDetailedMode(!detailedMode)}
          >
            {detailedMode ? "Detailed order on" : "Detailed order off"}
          </Button>

          <label
            className="text-sm text-slate-700"
            htmlFor="order-language-select"
          >
            Order language
          </label>
          <select
            id="order-language-select"
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white/80 px-3 text-sm text-slate-900"
          >
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {LANGUAGE_LABELS[language] || language}
              </option>
            ))}
          </select>
        </div>
      </section>

      <MassOrderRenderer
        mass={mass}
        fullOrderOfMass={fullOrder}
        detailedMode={detailedMode}
        prayers={prayers}
        selectedPrayerLanguage={selectedPrayerLanguage}
        prayerLanguages={prayerLanguages}
        onSelectPrayerLanguage={setSelectedPrayerLanguage}
      />

      <p className="text-center italic text-slate-700 mt-8 sm:mt-10">
        Have a blessed week.
      </p>
    </>,
  );
};

export default MassViewPage;
