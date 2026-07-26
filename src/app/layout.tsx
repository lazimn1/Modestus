import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import { AuthProvider } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  let initialIsAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    initialIsAdmin = !!data;
  }

  const initialUser = user
    ? {
        email: user.email ?? "",
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      }
    : null;

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=League+Gothic&display=swap" rel="stylesheet" />
      </head>
      <body className={`${cerkiymo.variable} font-sans bg-lightgray text-pureblack antialiased`}>
        <AuthProvider initialUser={initialUser} initialIsAdmin={initialIsAdmin}>
          <LayoutShell>
            {children}
          </LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}

