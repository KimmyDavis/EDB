"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("./create-event/new");
  }, []);
  return;
};

export default page;
