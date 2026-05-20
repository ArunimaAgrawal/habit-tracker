import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "HabitFlow - Track Your Daily Habits",
    template: "%s | HabitFlow",
  },
  description:
    "Build powerful daily habits with HabitFlow. Track multiple habits, set custom reminders, view streaks and analytics - all in one place.",
  keywords: ["habit tracker", "daily habits", "productivity", "streak tracker"],
  openGraph: {
    title: "HabitFlow - Track Your Daily Habits",
    description: "Build and track powerful daily habits with custom schedules.",
    type: "website",
    url: "https://yoursite.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitFlow",
    description: "Track multiple habits with custom time scheduling.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
