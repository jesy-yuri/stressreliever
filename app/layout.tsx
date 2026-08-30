import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anti-Stress Playground",
  description: "A tiny digital toy box for a happier brain."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}