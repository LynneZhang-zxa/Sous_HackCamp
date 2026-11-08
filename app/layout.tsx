import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { VoiceComposer } from "@/components/VoiceComposer";
import { AccessProvider } from "@/components/access/AccessProvider";
import { RouteAccessibility } from "@/components/access/RouteAccessibility";

// Keep fonts in the repository so builds do not depend on Google Fonts access.
const display = localFont({
  src: "./fonts/young-serif/YoungSerif-Regular.ttf",
  weight: "400",
  display: "swap",
  variable: "--font-young-serif",
});
const body = localFont({
  src: "./fonts/figtree/Figtree.ttf",
  weight: "300 900",
  display: "swap",
  variable: "--font-figtree",
});
const hand = localFont({
  src: "./fonts/caveat/Caveat.ttf",
  weight: "400 700",
  display: "swap",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Sous · Your AI cooking companion",
  description: "Hands-free, step-by-step cooking guidance you can talk to.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${hand.variable}`}>
      <body className="bg-cream text-ink font-body antialiased"><AccessProvider><RouteAccessibility />{children}<VoiceComposer /></AccessProvider></body>
    </html>
  );
}
