"use client";
import React from "react";
import { useQuerySongsQuery } from "@/features/songs/songsApiSlice";

const Songs = () => {
  const { data, isLoading, isSuccess, isError, error, refetch } =
    useQuerySongsQuery();
  let songs = data?.songs;
  console.log(songs);
  let theDom = null;
  if (isLoading) {
    theDom = <div className="loading">Loading songs...</div>;
  } else if (isError) {
    theDom = <div className="error">Error loading songs...</div>;
  } else {
    theDom = (
      <div className="songs flex flex-col gap-2">
        {!songs?.length ? (
          <span>No songs found.</span>
        ) : (
          songs.map((song) => {
            return (
              <div className="song bg-amber-100" key={song._id}>
                <div className="title">{song.title}</div>
                <div className="service">{song.service}</div>
                <div className="section-category">
                  {song.service == "catholic" ? song.section : song.category}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }
  return theDom;
};

export default Songs;
