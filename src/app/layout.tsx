import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kingdom Command · Sovereign Telemetry",
  description: "Multi-tenant AI workforce dashboard. Built for Craig Sr. The Lord builds the house.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
