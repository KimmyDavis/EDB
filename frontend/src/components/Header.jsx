"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";

const Header = () => {
  const router = useRouter();
  return (
    <div className="bg-primary absolute top-0 left-0 w-full h-24 text-primary-foreground flex flex-row items-center p-3 select-none">
      <h1
        className="text-3xl font-bold cursor-pointer"
        onClick={() => router.push("/")}
      >
        EDB
      </h1>
      <nav className="ml-auto">
        <Button
          className="cursor-pointer"
          onClick={() => router.push("/songs/song-editor/new")}
        >
          add song
        </Button>
      </nav>
    </div>
  );
};

export default Header;
