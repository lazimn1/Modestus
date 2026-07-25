"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAdmin || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="pt-[72px] flex flex-col min-h-screen">
        {children}
      </main>
    </>
  );
}
