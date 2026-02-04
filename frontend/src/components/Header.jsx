"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { Plus } from "lucide-react";
import useAuth from "@/hooks/use-auth";
import { Input } from "./ui/input";
import { Unlock } from "lucide-react";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isEditor } = useAuth();
  const [pword, setPword] = useState("");
  const handleBecomeEditor = () => {
    if (pword == "123123") {
      localStorage.setItem("isEditor", JSON.stringify(true));
      window.location.href = window.location.href;
    }
  };
  const [atHome, setAtHome] = useState(false);
  useEffect(() => {
    setAtHome(pathname.split("/").filter((p) => p != "").length == 0);
  }, [pathname]);
  useEffect(() => {
    console.log("at home => ", atHome, pathname);
  }, [atHome]);
  return (
    <div className="bg-primary absolute top-0 left-0 w-full h-24 text-primary-foreground flex flex-row items-center p-3 select-none">
      <h1
        className="text-3xl font-bold cursor-pointer"
        onClick={isEditor ? () => router.push("/") : () => {}}
      >
        EDB
      </h1>
      {atHome && (
        <nav className="ml-auto flex flex-row gap-2">
          {!isEditor ? (
            <div className="password-entry flex flex-row">
              <Input
                type="password"
                value={pword}
                onChange={(e) => setPword(e.target.value)}
              />
              <Button onClick={handleBecomeEditor}>
                <Unlock />
              </Button>
            </div>
          ) : (
            <>
              <Button
                className="cursor-pointer shadow-xs shadow-white"
                onClick={() => router.push("/songs/song-editor/new")}
              >
                <Plus />
                add song
              </Button>
              <Button
                className="cursor-pointer p-3 text-lg shadow-xs shadow-white"
                onClick={() => router.push("/mass/mass-editor/new")}
              >
                <Pencil />
                Create Mass
              </Button>
              <Button
                className="cursor-pointer p-3 text-lg shadow-xs shadow-white"
                onClick={() => router.push("/mass")}
              >
                <Pencil />
                View mass
              </Button>
            </>
          )}
        </nav>
      )}
    </div>
  );
};

export default Header;
