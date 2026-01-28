"use client";
import { useQuerySongsQuery } from "@/features/songs/songsApiSlice";
import { useRouter } from "next/navigation";
import React, { use } from "react";

const page = ({ params }) => {
  const { songCode } = use(params);
  const { data, isLoading, isError, error } = useQuerySongsQuery({
    code: songCode,
  });
  const song = data?.songs?.[0];
  console.log(song);
  if (isLoading) {
    return (
      <div className="loading">
        <span>Loading song...</span>
      </div>
    );
  } else if (isError) {
    return (
      <div className="error">
        <span>Error loading song :(</span>
      </div>
    );
  }
  return (
    <div className="w-full min-h-full flex flex-col items-center">
      <div className="song-body w-max max-w-full flex flex-col p-10 ">
        <h2 className="title text-3xl font-semibold">{song?.title}</h2>
        <div className="links my-3">
          <h3 className="links text-sm font-semibold">Links:</h3>
          <div className="links-list">
            {song?.links &&
              song?.links?.map((link, i) => {
                return (
                  <a
                    key={i}
                    href={link}
                    className="text-xs text-sky-400 line-clamp-1"
                  >
                    {link}
                  </a>
                );
              })}
          </div>
        </div>
        {song?.chorus && (
          <div className="chorus my-2">
            <h3 className="text-xl">Chorus: </h3>
            <div className="chorus-body">
              {song?.chorus?.split("\n").map((line, i) => {
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>
        )}
        <div className="verses">
          {song?.verses.map((verse, i) => {
            return (
              <div key={i} className="verse my-2">
                <h3 className="text-xl ">Verse {i + 1}:</h3>
                <div className="verse-body">
                  {verse.split("\n").map((line, j) => {
                    return <p key={j}>{line}</p>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default page;
