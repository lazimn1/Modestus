import { Inter, Outfit, Montserrat, Playfair_Display, Courgette, Luckiest_Guy } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
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

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const courgette = Courgette({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-courgette",
});

const luckiestGuy = Luckiest_Guy({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-luckiest-guy",
});

const cerkiymo = localFont({
  src: "./fonts/cerkiymo.otf",
  variable: "--font-cerkiymo",
});

const comfortaa = localFont({
  src: "./fonts/comfortaa.ttf",
  variable: "--font-comfortaa",
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
      <body className={`${inter.variable} ${outfit.variable} ${montserrat.variable} ${playfair.variable} ${courgette.variable} ${luckiestGuy.variable} ${cerkiymo.variable} ${comfortaa.variable} font-sans bg-lightgray text-pureblack antialiased`}>
        <Navbar />
        <main className="pt-[72px] flex flex-col min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
