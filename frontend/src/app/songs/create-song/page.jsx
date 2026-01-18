"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";

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

const CreateSong = () => {
  const [title, setTitle] = useState("");
  const [service, setService] = useState("catholic");
  const [section, setSection] = useState("");
  const [category, setCategory] = useState("");
  const [verses, setVerses] = useState([]);
  const [chorus, setChorus] = useState("");
  const [bridge, setBridge] = useState("");
  const [links, setLinks] = useState([]);

  // monitors
  const [verseCount, setVerseCount] = useState(verses.length || 0);
  const [linkCount, setLinkCount] = useState(links.length || 0);
  const [hasChorus, setHasChorus] = useState(Boolean(chorus));
  const [hasBridge, setHasBridge] = useState(Boolean(bridge));

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
    let theVerses;
    if (verse === "" && verses[i] === "") {
      theVerses = [...verses.splice(i, 1)];
    } else {
      theVerses = [...verses];
      theVerses[i] = verse;
    }
    setVerses(theVerses);
  };

  // effects
  useEffect(() => {
    console.log(verses, !verses?.length);
  }, [verses]);
  return (
    <div>
      {/* title section */}
      <div className="title flex flex-row w-full max-w-200">
        <Label className="min-w-24">Song Title:</Label>
        <Input />
      </div>
      {/* service selection section */}
      <div className="service flex flex-row gap-2">
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
      <div className="verses">
        {verses.map((verse, i) => {
          return (
            <Textarea
              key={i}
              value={verse}
              onChange={(e) => handleVerseEdit(e, i)}
            />
          );
        })}
        {(!verses?.length || verses?.[verses?.length - 1] !== "") && (
          <Button variant="outline" onClick={handleAddVerse}>
            Add a verse
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateSong;
