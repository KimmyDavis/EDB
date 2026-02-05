"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { Plus } from "lucide-react";
import useAuth from "@/hooks/use-auth";
import { Input } from "./ui/input";
import { Unlock } from "lucide-react";
import { Church } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Music } from "lucide-react";
import { Home } from "lucide-react";
const endpoints = [
  {
    title: "Home",
    path: "/",
    icon: <Home />,
  },
  {
    title: "add song",
    path: "/songs/song-editor/new",
    icon: <Plus />,
  },
  {
    title: "Create Mass",
    path: "/mass/mass-editor/new",
    icon: <Pencil />,
  },
  {
    title: "View mass",
    path: "/mass",
    icon: <Church />,
  },
  {
    title: "songs",
    path: "/songs",
    icon: <Music />,
  },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isEditor } = useAuth();
  const [pword, setPword] = useState("");
  const [atHome, setAtHome] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");

  // handlers
  const handleBecomeEditor = () => {
    if (pword == "123123") {
      localStorage.setItem("isEditor", JSON.stringify(true));
      window.location.href = window.location.href;
    }
  };

  useEffect(() => {
    setAtHome(pathname.split("/").filter((p) => p != "").length == 0);
  }, [pathname]);
  useEffect(() => {
    console.log("at home => ", atHome, pathname);
  }, [atHome]);
  useEffect(() => {
    router.push(currentLocation);
  }, [currentLocation]);
  return (
    <div className="bg-primary absolute top-0 left-0 w-full h-24 text-primary-foreground flex flex-row items-center p-3 select-none">
      <h1
        className={`text-3xl font-bold cursor-pointer ${
          !isEditor && "w-full text-center"
        }`}
        onClick={isEditor ? () => router.push("/") : () => {}}
      >
        EDB
      </h1>
      {(atHome || isEditor) && (
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
            <Select onValueChange={setCurrentLocation} value={currentLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="home" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>song type</SelectLabel>
                  {endpoints.map((ep, i) => {
                    return (
                      <SelectItem value={ep.path} key={i}>
                        {ep.icon} {ep.title}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </nav>
      )}
    </div>
  );
};

export default Header;
