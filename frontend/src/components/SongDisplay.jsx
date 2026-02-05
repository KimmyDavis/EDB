"use client";
import React, { useEffect, useState } from "react";

const SongDisplay = ({ song, partTitles, className }) => {
  let songDom = null;
  if (!song?.structure?.length) {
    songDom = (
      <>
        {song?.chorus && (
          <div className="chorus my-2 font-bold italic">
            {partTitles && <h3 className="text-xl">Chorus: </h3>}
            <div className="chorus-body">
              {song?.chorus?.split("\n").map((line, i) => {
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>
        )}
        {song?.bridge && (
          <div className="bridge my-2 font-semibold">
            {partTitles && <h3 className="text-xl">Bridge: </h3>}
            <div className="bridge-body">
              {song?.bridge?.split("\n").map((line, i) => {
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>
        )}
        <div className="verses">
          {song?.verses
            ?.filter((v) => v != "")
            ?.map((verse, i) => {
              return (
                <div key={i} className="verse my-2">
                  {partTitles && <h3 className="text-xl ">Verse {i + 1}:</h3>}
                  <div className="verse-body">
                    {verse.split("\n").map((line, j) => {
                      return <p key={j}>{line}</p>;
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </>
    );
  } else {
    let verseIndex = 0;
    songDom = song?.structure.map((item, i) => {
      if (item == "chorus") {
        return (
          <div className="chorus my-2" key={"chorus" + i}>
            {partTitles && <h3 className="text-xl">Chorus: </h3>}
            <div className="chorus-body flex flex-col gap-0 pl-2 font-semibold italic">
              {song?.chorus?.split("\n").map((line, i) => {
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>
        );
      }
      if (item == "bridge") {
        return (
          <div className="bridge my-2 pl-1 font-semibold" key={"bridge" + i}>
            {partTitles && <h3 className="text-xl">Bridge: </h3>}
            <div className="bridge-body">
              {song?.bridge?.split("\n").map((line, i) => {
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>
        );
      }
      if (item == "verse") {
        const verseBody = (
          <div className="verse my-2" key={"verse" + verseIndex}>
            {partTitles && (
              <h3 className="text-xl ">Verse {verseIndex + 1}:</h3>
            )}
            <div className="verse-body">
              {song?.verses?.[verseIndex].split("\n").map((line, j) => {
                return (
                  <p key={j} className="">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        );
        verseIndex++;
        return verseBody;
      }
    });
  }
  return (
    <div
      className={
        className + " " + "song-body w-max max-w-full flex flex-col p-2"
      }
    >
      <h2 className="title text-xl font-semibold">{song?.title}</h2>
      {song?.links?.filter((l) => l != "")?.length > 0 && (
        <div className="links my-3">
          {partTitles && (
            <h3 className="links text-sm font-semibold">Links:</h3>
          )}
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
      )}
      {songDom}
    </div>
  );
};

export default SongDisplay;
