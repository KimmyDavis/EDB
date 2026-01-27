"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";

const Header = () => {
  const router = useRouter();
  return (
    <div className="bg-primary w-full h-24 text-primary-foreground flex flex-row items-center p-3">
      <h1 className="text-3xl font-bold" onClick={() => router.push("/")}>
        EDB
      </h1>
      <nav className="ml-auto">
        <Button onClick={() => router.push("/songs/create-song")}>
          add song
        </Button>
      </nav>
    </div>
  );
};

export default Header;
