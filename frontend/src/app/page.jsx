"use client";
import Image from "next/image";
import { songs } from "@/constants/songs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PencilRulerIcon } from "lucide-react";
import { Pencil } from "lucide-react";
import { Music } from "lucide-react";

export default function Home() {
  const router = useRouter();
  return (
    <div className="home w-full px-2 py-24 flex flex-col items-center justify-center">
      <div className="buttons flex flex-row gap-2">
        <Button
          className="cursor-pointer p-3 text-lg"
          onClick={() => router.push("/songs")}
        >
          <Music />
          Songs
        </Button>
      </div>
    </div>
  );
}
