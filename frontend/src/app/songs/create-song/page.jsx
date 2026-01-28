"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useRef, useState } from "react";

// components
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
import { useCreateSongMutation } from "@/features/songs/songsApiSlice";
import { toast } from "sonner";

const CreateSong = () => {
  // hooks
  const [submitSong, { isLoading, isSuccess, isError, error }] =
    useCreateSongMutation();
  // page state
  const [title, setTitle] = useState("");
  const [service, setService] = useState("catholic");
  const [section, setSection] = useState("");
  const [category, setCategory] = useState("");
  const [verses, setVerses] = useState([""]);
  const [chorus, setChorus] = useState("");
  const [bridge, setBridge] = useState("");
  const [links, setLinks] = useState([""]);
  const [inputError, setInputError] = useState("");

  // monitors
  const [hasChorus, setHasChorus] = useState(Boolean(chorus));
  const [hasBridge, setHasBridge] = useState(Boolean(bridge));
  const [hasLinks, setHasLinks] = useState(Boolean(links?.length));

  // refs
  const lastVerseRef = useRef(null);
  const lastLinRef = useRef(null);

  // static
  const serviceTypes = ["catholic", "evangelical", "both"];
  const evangelicalServiceCategories = ["praise", "worship"];
  const massSections = [
    "entrance",
    "kyrie",
    "gloria",
    "acclamation",
    "creed",
    "petition",
    "Lord's prayer",
    "offertory",
    "sanctus",
    "peace",
    "agnus dei",
    "holy communion",
    "thanksgiving",
    "exit",
  ];

  // handlers
  const handleServiceChange = (serviceType) => {
    if (serviceType == "catholic") setCategory("");
    if (serviceType == "evangelical") setSection("");
    setService(serviceType);
  };

  const handleAddVerse = () => {
    setVerses([...verses, ""]);
  };

  const handleVerseEdit = (e, i) => {
    const verse = e.target.value;
    const theVerses = [...verses];
    theVerses[i] = verse;
    setVerses(theVerses);
  };

  const handleTextAreaKeyDown = (e, i) => {
    if (e.target.value === "" && e.key === "Backspace" && verses?.length > 1) {
      const theVerses = [...verses];
      theVerses.splice(i, 1);
      setVerses(theVerses);
    }
  };

  const handleAddLink = () => {
    setLinks([...links, ""]);
  };

  const handleLinkEdit = (e, i) => {
    const link = e.target.value;
    const theLinks = [...links];
    theLinks[i] = link;
    setLinks(theLinks);
  };

  const handleLinkKeyDown = (e, i) => {
    if (e.target.value === "" && e.key === "Backspace" && links?.length > 1) {
      const theLinks = [...links];
      theLinks.splice(i, 1);
      setLinks(theLinks);
    } else if (
      e.target.value !== "" &&
      e.key === "Enter" &&
      links?.[links?.length - 1] !== ""
    ) {
      handleAddLink();
    }
  };

  const handleSubmit = async () => {
    if (!title) return setInputError("song title is required.");
    else if (!service) return setInputError("Service is required.");
    else if (["catholic", "both"].includes(service) && !section)
      return setInputError("Specify a section of mass for the song.");
    else if (["evangelical", "both"].includes(service) && !category)
      return setInputError("Specify a category for the song.");
    else if (!verses?.length || (verses?.length == 1 && verses?.[0] == ""))
      return setInputError("Provide atleast one verse.");
    else if (hasChorus && !chorus)
      return setInputError("You should provide a chorus if you activated it.");
    else if (hasBridge && !bridge)
      return setInputError("You should provide a bridge if you activated it.");
    else if (
      hasLinks &&
      (!links?.length || (links?.length == 1 && links?.[0] == ""))
    )
      return setInputError(
        "You should provide atleast one link if you activated them."
      );

    let readySong = {
      title,
      service,
      verses: verses.filter((v) => v != ""),
    };
    if (section) readySong = { ...readySong, section };
    if (category) readySong = { ...readySong, category };
    if (hasChorus && chorus) readySong = { ...readySong, chorus };
    if (hasBridge && bridge) readySong = { ...readySong, bridge };
    if (hasLinks && links.filter((l) => l != "")?.length)
      readySong = { ...readySong, links: links.filter((l) => l != "") };
    console.log(readySong);
    await submitSong(readySong);
    setInputError("");
  };

  // effects
  useEffect(() => {
    setInputError("");
  }, [title, service, section, category, verses, chorus, bridge, links]);
  useEffect(() => {
    // if (lastVerseRef.current && verses?.[verses?.length - 1] == "")
    // lastVerseRef.current.focus();
  }, [verses]);

  useEffect(() => {
    // if (lastLinRef.current && links?.[links?.length - 1] == "")
    // lastLinRef.current.focus();
  }, [links]);

  useEffect(() => {
    if (inputError !== "") {
      toast.error(inputError, {
        duration: 2000,
        position: "top-center",
        style: { accentColor: "red" },
      });
      setInputError("");
    }
  }, [inputError]);

  return (
    <div className="w-full p-10 flex flex-col gap-8 items-center">
      {/* title section */}
      <div className="title flex flex-row w-full max-w-200">
        <Label className="min-w-24">Song Title:</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      {/* service selection section */}
      <div className="service flex flex-row gap-2 w-full max-w-200">
        <Label>Service: </Label>
        <Select onValueChange={handleServiceChange} value={service}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>song type</SelectLabel>
              {serviceTypes.map((serviceType, i) => {
                return (
                  <SelectItem value={serviceType} key={i}>
                    {serviceType}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {/* section and category section */}
      <div className="section-category w-full max-w-200">
        {["catholic", "both"].includes(service) && (
          <div className="catholic flex flex-row gap-2 w-full">
            <Label className="min-w-24">Section of Mass: </Label>
            <Select onValueChange={setSection} value={section}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>section</SelectLabel>
                  {massSections.map((massSection, i) => {
                    return (
                      <SelectItem value={massSection} key={i}>
                        {massSection}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {["evangelical", "both"].includes(service) && (
          <div className="evangelical flex flex-row gap-2 w-full">
            <Label className="min-w-24">Song Category: </Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="song category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>categories</SelectLabel>
                  {evangelicalServiceCategories.map((category, i) => {
                    return (
                      <SelectItem value={category} key={i}>
                        {category}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      {/* verses section */}
      <div className="verses w-full max-w-200 flex flex-col gap-2">
        <h3 className="verses font-semibold text-lg">Song Verses</h3>
        {verses.map((verse, i) => {
          return (
            <div key={i} className="verse mb-1">
              <span>Verse {i + 1}:</span>
              <Textarea
                value={verse}
                onChange={(e) => handleVerseEdit(e, i)}
                onKeyDown={(e) => handleTextAreaKeyDown(e, i)}
                ref={i === verses?.length - 1 ? lastVerseRef : null}
                className="mt-1"
              />
            </div>
          );
        })}
        {(!verses?.length || verses?.[verses?.length - 1] !== "") && (
          <Button
            variant="outline"
            onClick={handleAddVerse}
            className="w-max p-2 self-end"
          >
            Add a verse
          </Button>
        )}
      </div>
      {/* optionals toggles */}
      <div className="optionals-toggles flex flex-row justify-around mt-10 w-full max-w-200">
        <div className="flex items-center space-x-2">
          <Switch
            checked={hasChorus}
            onCheckedChange={() => setHasChorus(!hasChorus)}
            id="chorus"
          />
          <Label htmlFor="chorus">chorus</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={hasBridge}
            onCheckedChange={() => setHasBridge(!hasBridge)}
            id="bridge"
          />
          <Label htmlFor="bridge">bridge</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={hasLinks}
            onCheckedChange={() => setHasLinks(!hasLinks)}
            id="links"
          />
          <Label htmlFor="links">links</Label>
        </div>
      </div>
      {/* chorus */}
      {hasChorus && (
        <div className="w-full max-w-200">
          <h3 className="chorus">Chorus: </h3>
          <Textarea
            value={chorus}
            onChange={(e) => setChorus(e.target.value)}
            className="mt-1"
          />
        </div>
      )}
      {/* bridge */}
      {hasBridge && (
        <div className="w-full max-w-200">
          <h3 className="chorus">Bridge: </h3>
          <Textarea
            value={bridge}
            onChange={(e) => setBridge(e.target.value)}
            className="mt-1"
          />
        </div>
      )}
      {/* lins */}
      {hasLinks && (
        <div className="verses w-full max-w-200 flex flex-col gap-2">
          <h3 className="verses">Links: </h3>
          {links.map((link, i) => {
            return (
              <div key={i} className="verse mb-1">
                <Input
                  value={link}
                  onChange={(e) => handleLinkEdit(e, i)}
                  onKeyDown={(e) => handleLinkKeyDown(e, i)}
                  ref={i === links?.length - 1 ? lastLinRef : null}
                  className="mt-1 max-w-100"
                />
              </div>
            );
          })}
          {(!links?.length || links?.[links?.length - 1] !== "") && (
            <Button
              variant="outline"
              onClick={handleAddLink}
              className="w-max p-2 self-start"
            >
              + link
            </Button>
          )}
        </div>
      )}
      {/* submit button */}
      <div className="submit w-full max-w-200 flex flex-row">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="ml-auto mr-2"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateSong;
