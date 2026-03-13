"use client";
import SongDisplay from "@/components/SongDisplay";
import { selectAllSongs } from "@/features/songs/songsApiSlice";
import Image from "next/image";
import React, { use } from "react";
import { useSelector } from "react-redux";

const page = ({ params }) => {
  const {
    data: allSongsData,
    isLoading = true,
    isError,
  } = useSelector(selectAllSongs);
  const { songCode } = use(params);
  const song = allSongsData?.songs?.filter((s) => s.code === songCode)?.[0];

  const shell = (content) => (
    <div className="relative bg-theme-gold/90 min-h-screen p-6">
      <Image
        loading="eager"
        src="/images/backgrounds/debut-light.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-0"
      />
      <div className="relative z-10 max-w-5xl mx-auto">{content}</div>
    </div>
  );

  if (isLoading) {
    return shell(
      <div className="bg-[#fff5] rounded-xl p-6 shadow-sm border border-white/40">
        <p className="text-sm text-slate-700 mb-5">Loading song details...</p>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded bg-slate-300/70" />
          <div className="h-4 w-1/2 rounded bg-slate-300/70" />
          <div className="pt-2 space-y-3">
            <div className="h-4 w-full rounded bg-slate-300/70" />
            <div className="h-4 w-11/12 rounded bg-slate-300/70" />
            <div className="h-4 w-10/12 rounded bg-slate-300/70" />
            <div className="h-4 w-9/12 rounded bg-slate-300/70" />
            <div className="h-4 w-11/12 rounded bg-slate-300/70" />
          </div>
        </div>
      </div>,
    );
  } else if (isError) {
    return shell(
      <div className="bg-red-50/90 border border-red-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-red-900 mb-2">
          Could not load this song
        </h2>
        <p className="text-sm text-red-800">
          Something went wrong while fetching song details. Please try again.
        </p>
      </div>,
    );
  }

  if (!song) {
    return shell(
      <div className="bg-[#fff5] rounded-xl p-6 shadow-sm border border-white/40">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Song not found
        </h2>
        <p className="text-sm text-slate-700">
          We could not find a song with code{" "}
          <span className="font-mono">{songCode}</span>.
        </p>
      </div>,
    );
  }

  return shell(
    <div className="bg-[#fff5] rounded-xl p-6 shadow-sm border border-white/40">
      <SongDisplay song={song} partTitles={true} />
    </div>,
  );
};

export default page;
