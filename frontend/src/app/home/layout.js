import Header from "@/components/Header";
import Prefetcher from "@/components/Prefetcher";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashLayout({ children }) {
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
