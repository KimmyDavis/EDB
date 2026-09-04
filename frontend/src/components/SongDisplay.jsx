"use client";
import React, { useEffect, useState } from "react";
import {
  Apple,
  ExternalLink,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const resolveLinkPlatform = (link) => {
  let host = "";
  try {
    host = new URL(link, window.location.origin).hostname.replace(
      /^www\./,
      "",
    );
  } catch {
    return { name: "link", Icon: ExternalLink, color: "text-slate-500" };
  }

  const normalized = host.toLowerCase();
  if (
    normalized.includes("youtube") ||
    normalized === "youtu.be" ||
    normalized.includes("youtu.be")
  ) {
    return { name: "youtube", Icon: Youtube, color: "text-red-600" };
  }
  if (normalized.includes("facebook")) {
    return { name: "facebook", Icon: Facebook, color: "text-blue-600" };
  }
  if (normalized.includes("instagram")) {
    return { name: "instagram", Icon: Instagram, color: "text-pink-600" };
  }
  if (normalized.includes("twitter") || normalized.includes("x.com")) {
    return { name: "twitter", Icon: Twitter, color: "text-sky-600" };
  }
  if (normalized.includes("apple")) {
    return { name: "apple", Icon: Apple, color: "text-slate-600" };
  }

  const name = normalized.split(".")[0] || "link";
  return { name, Icon: ExternalLink, color: "text-slate-500" };
};

const SongDisplay = ({
  song,
  partTitles,
  className,
  hideLinks = false,
  centered = false,
}) => {
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
              {song?.verses?.[verseIndex]?.split("\n").map((line, j) => {
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
        cn(
          className,
          "song-body w-max max-w-full flex flex-col p-2",
          centered && "mx-auto",
        )
      }
    >
      <h2 className="title text-xl font-semibold">{song?.title}</h2>
      {!hideLinks && song?.links?.filter((l) => l != "")?.length > 0 && (
        <div className="links my-3">
          {partTitles && (
            <h3 className="links text-sm font-semibold">Links:</h3>
          )}
          <div className="links-list flex flex-wrap gap-2 mt-2">
            {song?.links &&
              song?.links?.filter((l) => l != "")?.map((link, i) => {
                const linksCount = song.links.filter((l) => l != "").length;
                const { name, Icon, color } = resolveLinkPlatform(link);
                const label = linksCount > 1 ? `${name} ${i + 1}` : name;
                return (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "text-primary",
                    )}
                  >
                    <Icon size={14} className={`shrink-0 ${color}`} />
                    <span className="capitalize">{label}</span>
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
