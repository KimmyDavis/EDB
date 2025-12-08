import "./globals.css";

export const metadata = {
  title: "Eglise de boumerdes",
  description: "Church management system for the community of boumerdes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className=""
      >
        {children}
      </body>
    </html>
  );
}
