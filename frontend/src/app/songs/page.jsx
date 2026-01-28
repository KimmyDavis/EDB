"use client";
import React from "react";
import { useQuerySongsQuery } from "@/features/songs/songsApiSlice";
import { useRouter } from "next/navigation";

const Songs = () => {
  const router = useRouter();
  const { data, isLoading, isSuccess, isError, error, refetch } =
    useQuerySongsQuery({});
  let songs = data?.songs;
  console.log(songs);
  let theDom = null;
  if (isLoading) {
    theDom = <div className="loading">Loading songs...</div>;
  } else if (isError) {
    theDom = <div className="error">Error loading songs...</div>;
  } else {
    theDom = (
      <div className="songs flex flex-col gap-2 w-full max-w-200">
        {!songs?.length ? (
          <span>No songs found.</span>
        ) : (
          songs.map((song) => {
            const theDate = new Intl.DateTimeFormat("en-US", {
              dateStyle: "short",
            }).format(new Date(song.createdAt));
            return (
              <div
                className="song bg-[#0001] hover:bg-[#0002] active:bg-[#0002] p-3 cursor-default"
                key={song._id}
                onClick={() => router.push("/songs/" + song.code)}
              >
                <h3 className="title text-xl">{song.title}</h3>
                <div className="meta flex gap-3 italic text-slate-400">
                  <span className="section-category">
                    {song.service == "catholic" ? song.section : song.category}
                  </span>
                  <span className="date">{theDate}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }
  return (
    <div className="songs-content w-full flex flex-col items-center justify-center p-5">
      {theDom}
    </div>
  );
};

export default Songs;
