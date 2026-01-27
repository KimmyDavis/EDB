import Header from "@/components/Header";
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Eglise de boumerdes",
  description: "Church management system for the community of boumerdes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <StoreProvider>
        <body className="">
          <Header />
          {children}
          <Toaster />
        </body>
      </StoreProvider>
    </html>
  );
}
