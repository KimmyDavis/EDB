"use client";
import React, { useEffect } from "react";
import { selectAllSongs } from "@/features/songs/songsApiSlice";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Edit } from "lucide-react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const Songs = () => {
  const router = useRouter();
  const {
    data: songsData,
    isLoading = true,
    isError,
  } = useSelector(selectAllSongs) || [];
  let songs = songsData?.songs;
  let theDom = null;

  useEffect(() => {
  }, [isLoading]);

  theDom = (
    <div className="songs flex flex-col gap-2 w-full max-w-200">
      {isLoading ? (
        <span className="text-center w-full">Searching songs... 🥲</span>
      ) : isError ? (
        <span>Failed to fetch songs. 🥲</span>
      ) : (
        songs?.map((song) => {
          const theDate = new Intl.DateTimeFormat("en-US", {
            dateStyle: "short",
          }).format(new Date(song.createdAt));
          return (
            <div
              className="song relative bg-[#0001] hover:bg-[#0002] active:bg-[#0002] p-3 cursor-default"
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
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/songs/song-editor/" + song._id);
                }}
                className="absolute bottom-1 right-1 rounded-full scale-80"
              >
                <Pencil className=" " />
              </Button>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="songs-content w-full flex flex-col items-center justify-center p-5">
      {theDom}
    </div>
  );
};

export default Songs;
