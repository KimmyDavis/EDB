"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Pencil } from "lucide-react";
import { Plus } from "lucide-react";
import { Church } from "lucide-react";
import { Music } from "lucide-react";
import { Home } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { toast } from "sonner";
import { useState } from "react";
import { Tent } from "lucide-react";
import { Building } from "lucide-react";
import { UserCheck } from "lucide-react";
import usePublicRoute from "@/hooks/use-public-route";
import { PwaInstallButton } from "./PwaInstallButton";
import { canAccessRole } from "@/lib/roles";

const endpoints = [
  {
    title: "Home",
    path: "/home/",
    icon: <Home />,
    role: "user",
  },
  {
    title: "Masses",
    path: "/home/mass",
    icon: <Church />,
    role: "user",
  },
  {
    title: "Create Mass",
    path: "/home/mass/mass-editor/new",
    icon: <Pencil />,
    role: "liturgy",
  },
  {
    title: "Songs",
    path: "/home/songs",
    icon: <Music />,
    role: "user",
  },
  {
    title: "Add song",
    path: "/home/songs/song-editor/new",
    icon: <Plus />,
    role: "liturgy",
  },
  {
    title: "Events",
    path: "/home/events",
    icon: <Building />,
    role: "user",
  },
  {
    title: "New event",
    path: "/home/events/create-event",
    icon: <Tent />,
    role: "media",
  },
  {
    title: "Admin Actions",
    path: "/auth/admin-actions",
    icon: <UserCheck />,
    role: "admin",
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isPublicRoute = usePublicRoute();
  const { data, isPending } = authClient.useSession();
  const hasSession = !!data?.session;
  const { user } = data || {};
  const userRole = user?.role;

  if (isPublicRoute && (isPending || !hasSession)) return null;

  const handleNavigate = (path) => {
    router.push(path);
    setOpenMobile(false);
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          setIsLoggingOut(true);
        },
        onSuccess: () => {
          router.push("/");
          setIsLoggingOut(false);
        },
        onError: () => {
          toast("Failed to logout. please try again.");
          setIsLoggingOut(false);
        },
      },
    });
  };
  return (
    <Sidebar
      side="right"
      variant="inset"
      className="h-screen fixed left-0 top-0 bg-theme-cream px-0"
    >
      <SidebarHeader className="bg-theme-cream">
        <h1 className="h1 font-bold text-xl text-theme-gold">EDB</h1>
      </SidebarHeader>
      <SidebarContent className="bg-theme-cream px-0">
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="text-primary">Go to</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="endpoints flex flex-col">
              {endpoints.map((endp, i) => {
                if (!canAccessRole(userRole, endp.role)) return;
                return (
                  <Button
                    key={endp.title + i}
                    onClick={() => handleNavigate(endp.path)}
                    className="rounded-none py-7 flex flex-row bg-theme-gold/50 hover:bg-theme-gold/30"
                  >
                    <span className="text-primary">{endp.icon}</span>
                    <span className="ml-3 mr-auto">{endp.title}</span>
                  </Button>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="bg-theme-cream">
        <PwaInstallButton />
        <div className="usr flex flex-col text-primary capitalize">
          <span>{user?.username}</span>
          <Button
            type="button"
            onClick={() => handleNavigate("/auth/edit-profile")}
            className=" text-sm text-theme-cream hover:bg-primary/70"
          >
            Manage account
          </Button>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-theme-gold hover:bg-theme-gold/60 mt-5"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
