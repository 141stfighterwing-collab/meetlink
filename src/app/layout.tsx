import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeetLink - Self-Hosted Scheduling Platform",
  description: "MeetLink is a self-hosted scheduling application that replicates Calendly's core functionality with a modern, customizable interface for privacy-focused users.",
  keywords: ["MeetLink", "Scheduling", "Calendar", "Booking", "Self-hosted", "Privacy", "Next.js", "TypeScript"],
  authors: [{ name: "MeetLink Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MeetLink - Self-Hosted Scheduling",
    description: "Privacy-focused scheduling platform for IT security environments",
    url: "https://meetlink.io",
    siteName: "MeetLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetLink - Self-Hosted Scheduling",
    description: "Privacy-focused scheduling platform for IT security environments",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
