"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutGrid,
  Package,
  FileText,
  MessageSquare,
  ShoppingCart,
  LogOut,
  Search,
  User,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/content", label: "Site Content", icon: FileText },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If we're on the login page, just render children (the login layout handles it)
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      queueMicrotask(() => setChecking(false));
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
      } else {
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!adminData) {
          router.replace("/");
        } else {
          setUserEmail(user.email ?? null);
          setChecking(false);
        }
      }
    });
  }, [isLoginPage, router]);

  // Close mobile menu on route change
  useEffect(() => {
    queueMicrotask(() => setMobileMenuOpen(false));
  }, [pathname]);

  // Login page — render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while checking auth
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`w-[260px] bg-white flex flex-col fixed top-0 left-0 h-screen z-50 border-r border-gray-100 md:hidden transition-transform duration-300 shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to store
            </Link>
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
              Modestus
              <span className="ml-1 text-[13px] font-semibold text-gray-500">Admin</span>
            </h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-[12px] rounded-lg text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-[20px] h-[20px] ${isActive ? "text-white" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 space-y-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-[12px] rounded-lg text-[15px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
          >
            <LogOut className="w-[20px] h-[20px] text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[220px] bg-white flex-col fixed top-0 left-0 h-screen z-30 border-r border-gray-100">
        {/* Brand */}
        <div className="px-6 py-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
            Modestus
            <br />
            <span className="text-[15px] font-semibold text-gray-500">Admin</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-[10px] rounded-lg text-[14px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-6 space-y-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-[10px] rounded-lg text-[14px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
          >
            <LogOut className="w-[18px] h-[18px] text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 ml-0 md:ml-[220px] flex flex-col min-h-screen max-w-full">
        {/* Floating Top Bar */}
        <header className="mx-3 sm:mx-6 mt-3 sm:mt-5 px-4 sm:px-6 h-[56px] bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl flex items-center justify-between shadow-sm sticky top-3 sm:top-5 z-20 gap-3">
          {/* Search & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 md:hidden transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-[180px] sm:max-w-[320px] md:max-w-[420px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search admin..."
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-[8px] bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          {/* Admin User */}
          <div className="flex items-center gap-3 ml-2 sm:ml-6 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                {userEmail ? userEmail.split("@")[0] : "Admin"}
              </p>
              <p className="text-[11px] text-gray-400">Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-3 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
