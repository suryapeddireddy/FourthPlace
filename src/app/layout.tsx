import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FourthPlace — Curated 4-Seat Micro-Mentorship at Hyderabad Cafes",
  description:
    "Skip cold DMs. Join intimate 4-person career, system design, and product mentorship tables hosted by verified builders across Jubilee Hills, Madhapur, and Gachibowli.",
  openGraph: {
    title: "FourthPlace — Curated 4-Seat Micro-Mentorship at Hyderabad Cafes",
    description:
      "Skip cold DMs. Join intimate 4-person career, system design, and product mentorship tables hosted by verified builders across Jubilee Hills, Madhapur, and Gachibowli.",
    siteName: "FourthPlace",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-cream text-espresso">
        {children}
      </body>
    </html>
  );
}
