"use client";
import { Button } from "@/components/ui/button";
import { useQueryMassQuery } from "@/features/mass/massApiSlice";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const Mass = () => {
  // hooks
  const router = useRouter();
  const { data: massData, isLoading, isError, error } = useQueryMassQuery({});
  const masses = massData?.mass;

  // handlers
  const handleCopyText = (e, text) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Link copied to clipboard", { position: "top-center" });
      })
      .catch((err) => {
        toast.error("Could not copy text: " + err, { position: "top-center" });
      });
  };
  console.log(masses);
  return (
    <div>
      {masses?.map((mass, i) => {
        const theDate = new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
        }).format(new Date(mass?.date));
        return (
          <div
            key={mass._id}
            onClick={() => router.push("/mass/" + mass?._id)}
            className="mass-item relative p-5 flex flex-col bg-[#0003] m-2 gap-2 rounded-lg"
          >
            <h3 className="font-bold text-xl">{mass?.title}</h3>
            <span>{theDate}</span>
            <div className="buttons flex flex-row gap-3  ml-auto">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/mass/mass-editor/${mass?._id}`);
                }}
                className="w-max rounded-full p-5 text-lg"
              >
                Edit
              </Button>
              <Button
                onClick={(e) =>
                  handleCopyText(e, `${window.location.host}/mass/${mass?._id}`)
                }
                className="w-max rounded-full p-5 text-lg"
              >
                Copy link
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Mass;
