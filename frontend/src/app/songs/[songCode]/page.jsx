"use client";
import SongDisplay from "@/components/SongDisplay";
import { selectAllSongs } from "@/features/songs/songsApiSlice";
import { useRouter } from "next/navigation";
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
  if (isLoading) {
    return (
      <div className="loading w-full text-center">
        <span>Looking for song... 🥲</span>
      </div>
    );
  } else if (isError) {
    return (
      <div className="loading w-full text-center">
        <span>Failed to find the song. 🥲</span>
      </div>
    );
  }
  return (
    <div className="w-full min-h-full flex flex-col items-center">
      {song && <SongDisplay song={song} partTitles={true} />}
    </div>
  );
};

export default page;
