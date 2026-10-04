"use client";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/use-auth";
import { SidebarTrigger } from "./ui/sidebar";
import { MenuIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import usePublicRoute from "@/hooks/use-public-route";
import { authClient } from "@/lib/authClient";

const isProjectorRoute = (pathname = "") =>
  /^\/home\/mass\/[^/]+\/projector-view\/?$/.test(pathname);

const Header = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = usePublicRoute();
  const { isEditor } = useAuth();
  const { data, isPending } = authClient.useSession();
  const hasSession = !!data?.session;

  if (isPublicRoute && (isPending || !hasSession)) return null;
  if (isProjectorRoute(pathname)) return null;

  return (
    <div className="relative overflow-hidden bg-theme-gold w-full h-16 text-primary-foreground flex flex-row items-center py-12 select-none">
      <h1
        className="text-3xl z-10 font-bold cursor-pointer pl-5"
        onClick={isEditor ? () => router.push("/home") : () => {}}
      >
        EDB
      </h1>
      <Image
        src="/images/logo.svg"
        loading="eager"
        width={500}
        height={500}
        alt="eglise de boumerdes logo"
        className={`absolute top-0 ${
          isMobile ? "left-0" : "right-0"
        } backdrop-brightness-110 w-24 rotate-12`}
      />
      <SidebarTrigger
        className="z-10 pr-10 ml-auto"
        icon={<MenuIcon className="scale-150" />}
      />
    </div>
  );
};

export default Header;
