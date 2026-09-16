import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthHeader from "@/components/AuthHeader";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionProvider } from "@/components/SessionProvider";

import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXTAUTH_URL || "https://leetcode-fsrs.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LeetCode FSRS | Spaced Repetition for Developers",
    template: "%s | LeetCode FSRS",
  },
  description: "Transform one-off LeetCode practice into permanent algorithmic recall with the FSRS spaced repetition model.",
  keywords: [
    "LeetCode",
    "FSRS",
    "Spaced Repetition",
    "Coding Interview",
    "Algorithm Practice",
    "Data Structures",
    "Software Engineering",
  ],
  authors: [{ name: "LeetCode FSRS" }],
  creator: "LeetCode FSRS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "LeetCode FSRS | Spaced Repetition for Developers",
    description: "Transform one-off LeetCode practice into permanent algorithmic recall with the FSRS spaced repetition model.",
    siteName: "LeetCode FSRS",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeetCode FSRS | Spaced Repetition for Developers",
    description: "Transform one-off LeetCode practice into permanent algorithmic recall with the FSRS spaced repetition model.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <CookieBanner />
          </ThemeProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
