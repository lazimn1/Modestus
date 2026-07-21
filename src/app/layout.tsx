import type { Metadata } from "next";
import { Inter, Outfit, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Modestus",
    default: "Modestus | Luxury Modest Fashion",
  },
  description: "Redefining modern modest wear with clean silhouettes and minimal aesthetics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=League+Gothic&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${montserrat.variable} font-sans bg-lightgray text-pureblack antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
