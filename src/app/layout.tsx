import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import AiStylistWidget from "@/components/AiStylistWidget";
import { AuthProvider } from "@/context/AuthContext";
import { getCustomerAction } from "@/app/actions/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialCustomer = await getCustomerAction();

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=League+Gothic&display=swap" rel="stylesheet" />
      </head>
      <body className={`${cerkiymo.variable} font-sans bg-lightgray text-pureblack antialiased`}>
        <AuthProvider initialCustomer={initialCustomer}>
          <LayoutShell>
            {children}
          </LayoutShell>
          <AiStylistWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
