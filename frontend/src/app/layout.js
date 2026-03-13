import StoreProvider from "@/lib/StoreProvider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import RequireAuth from "@/lib/RequireAuth";
export const metadata = {
  title: "Eglise de boumerdes",
  description: "Church management system for the community of boumerdes",
  "apple-mobile-web-app-title": "EDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/images/favicon/favicon.svg"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-poppins">
        <RequireAuth>
          <StoreProvider>
            <div className="main-cont relative min-h-screen w-full">
              <main className="w-full bg-theme-cream/10">{children}</main>
              <Toaster />
            </div>
          </StoreProvider>
        </RequireAuth>
      </body>
    </html>
  );
}
