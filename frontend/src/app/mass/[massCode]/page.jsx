"use client";
import SongDisplay from "@/components/SongDisplay";
import { useQueryMassQuery } from "@/features/mass/massApiSlice";
import Image from "next/image";
import React, { use, useEffect } from "react";

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

  const sectionOrder = [
    "entrance",
    "kyrie",
    "gloria",
    "psalmResponse",
    "acclamation",
    "creed",
    "petition",
    "offertory",
    "sanctus",
    "LordsPrayer",
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
  useEffect(() => {}, [massData]);

  if (isLoading) {
    return <div className="loading">Loading data...</div>;
  }
  if (isError) {
    <div className="error">An error occured...</div>;
  }

  if (!mass) {
    return <div className="no data">No data found...</div>;
  }

  return (
    <div className="relative mass-display flex flex-col items-center justify-center bg-purple-500/20">
      <Image
        src="/images/ash.jpeg"
        alt="Background"
        quality={100}
        width={100}
        height={300}
        sizes="100vw"
        style={{
          objectFit: "cover",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: "0px",
          left: "0px",
          zIndex: -1,
          opacity: 0.1,
        }}
      />
      <h1 className="text-3xl font-bold mt-10">{mass?.title}</h1>
      <div className="inner-cont flex flex-col w-full max-w-200">
        {sectionOrder?.map((section, i) => {
          if (mass?.[section]?.included === false) {
            return;
          }
          if (mass?.[section]?.recited) {
            return (
              <div
                key={section + "-recited-" + i}
                className="recited italic text-center px-10"
              >
                <h3 className="section-title  capitalize text-2xl font-bold mt-20 bg-[#0002] rounded-full">
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
                className="recited italic text-center px-10"
              >
                <h3 className="section-title  capitalize text-2xl font-bold mt-10 bg-[#0002] rounded-full">
                  {handleSectionName("psalm response")}
                </h3>
                {mass?.["psalmResponse"]}
              </div>
            );
          }
          if (mass?.[section]?.songId) {
            return (
              <div className="song-body-mass px-10" key={section + " " + i}>
                <h3 className="section-title capitalize text-2xl font-bold text-center mt-10 bg-[#0002] rounded-full">
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
      <span className="span italic">have a blessed week...</span>
    </div>
  );
};

export default ShowMass;
