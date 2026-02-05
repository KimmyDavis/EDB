"use client";
import SongDisplay from "@/components/SongDisplay";
import { useQueryMassQuery } from "@/features/mass/massApiSlice";
import React, { use, useEffect } from "react";

const trialCode = "H50575S";

const ShowMass = ({ params }) => {
  // hooks
  const { massCode } = use(params);
  const {
    data: massData,
    isLoading,
    isError,
    error,
  } = useQueryMassQuery({ id: massCode }, { skip: !massCode });
  const mass = massData?.mass?.[0];
  console.log(mass);

  const sectionOrder = [
    "entrance",
    "kyrie",
    "gloria",
    "psalmResponse",
    "acclamation",
    "creed",
    "petition",
    "LordsPrayer",
    "offertory",
    "sanctus",
    "peace",
    "agnusDei",
    "holyCommunion",
    "thanksgiving",
    "exit",
  ];
  // handlers
  const handleSectionName = (section) => {
    if (section == "psalmResponse") return "Response";
    if (section == "LordsPrayer") return "Lord's Prayer";
    if (section == "agnusDei") return "Agnus Dei";
    if (section == "holyCommunion") return "Holy Communion";
    else return section;
  };
  useEffect(() => {
    console.log(massData);
  }, [massData]);

  if (isLoading) {
    return <div className="loading">Loading data...</div>;
  }
  if (isError) {
    <div className="error">An error occured...</div>;
  }

  return (
    <div className="mass-display flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mt-10">{mass?.title}</h1>
      <div className="inner-cont flex flex-col w-full max-w-200">
        {sectionOrder?.map((section, i) => {
          console.log(mass?.[section]?.songId);
          if (mass[section]?.included === false) {
            return;
          }
          if (mass?.[section]?.recited) {
            return (
              <div
                key={section + "-recited-" + i}
                className="recited italic text-center"
              >
                <h3 className="section-title  capitalize text-2xl font-bold mt-20">
                  {handleSectionName(section)}
                </h3>
                to be recited...
              </div>
            );
          }
          if (section === "psalmResponse" && mass?.["psalmResponse"]) {
            return (
              <div
                key={section + "-recited-" + i}
                className="recited italic text-center"
              >
                <h3 className="section-title  capitalize text-2xl font-bold mt-20">
                  {handleSectionName("psalm response")}
                </h3>
                {mass?.["psalmResponse"]}
              </div>
            );
          }
          if (mass?.[section]?.songId) {
            return (
              <div className="song-body-mass" key={section + " " + i}>
                <h3 className="section-title capitalize text-2xl font-bold text-center mt-20">
                  {handleSectionName(section)}
                </h3>
                <SongDisplay
                  song={mass?.[section]?.songId}
                  partTitles={false}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default ShowMass;
