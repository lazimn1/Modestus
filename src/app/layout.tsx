import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

const cerkiymo = localFont({
  src: "./fonts/cerkiymo.otf",
  variable: "--font-cerkiymo",
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
      <body className={`${cerkiymo.variable} font-sans bg-lightgray text-pureblack antialiased`}>
        <Navbar />
        <main className="pt-[72px] flex flex-col min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
