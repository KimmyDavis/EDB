"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Prefetcher from "@/components/Prefetcher";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/authClient";
import { hasRequiredProfileInfo } from "@/constants/required-profile-info";

const EVENT_PAGE = /^\/home\/events\/event\/[^/]+\/?$/;

export default function DashLayout({ children }) {
  const pathname = usePathname();
  const { data, isPending } = authClient.useSession();
  const user = data?.user;
  const session = data?.session;

  const isEventPage = EVENT_PAGE.test(pathname || "");
  const isFullyAuthorized =
    Boolean(session) &&
    Boolean(user?.emailVerified) &&
    Boolean(user?.verified) &&
    hasRequiredProfileInfo(user);

  // Focused, chrome-less view for non-authorized visitors on the event page.
  const hideChrome = isEventPage && !isPending && !isFullyAuthorized;

  if (hideChrome) {
    return (
      <div className="main-cont relative min-h-screen w-full">{children}</div>
    );
  }

  return (
    <div className="main-cont relative min-h-screen w-full">
      <Prefetcher />
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <TooltipProvider>
            <Header />
            {children}
          </TooltipProvider>
        </main>
      </SidebarProvider>
    </div>
  );
}
