import Header from "@/components/Header";
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import Prefetcher from "@/components/Prefetcher";

export const metadata = {
  title: "Eglise de boumerdes",
  description: "Church management system for the community of boumerdes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <StoreProvider>
        <body className="">
          <div className="main-cont relative pt-24 min-h-screen w-full">
            <Prefetcher />
            <Header />
            {children}
            <Toaster />
          </div>
        </body>
      </StoreProvider>
    </html>
  );
}
