import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const brandFont = localFont({
  src: "./fonts/Syne-VariableFont_wght.ttf",
  weight: "400 800",
  display: "swap",
  variable: "--font-brand",
});
const matterFont = localFont({
  src: "./fonts/MatterTRIALVF-Uprights.woff2",
  display: "swap",
  variable: "--font-matter",
  weight: "100 900",
});
const recklessNeueFont = localFont({
  src: "./fonts/RecklessNeueTRIALVF-Uprights.woff2",
  display: "swap",
  variable: "--font-reckless-neue",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PeerPrep",
  description: "Prep for your next interview with your Peers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${brandFont.variable} ${matterFont.variable} ${recklessNeueFont.variable} font-sans antialiased bg-white`}
      >
        {children}
      </body>
    </html>
  );
}
