"use client";
import ProfileForm from "@/components/shadcn-space/blocks/forms-01/profile-form";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import React from "react";

const page = () => {
  return (
    <div>
      <ProfileForm />
    </div>
  );
};

export default page;
