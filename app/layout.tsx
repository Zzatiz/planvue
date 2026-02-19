import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planvue — Creator Chat CRM",
  description: "AI-powered fan relationship management for creator economy operators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
