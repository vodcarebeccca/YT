import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuardAI — AI-Powered Community Security",
  description:
    "Automatically detect spam, scams, gambling, toxic behavior and threats before they damage your community.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
