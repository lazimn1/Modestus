"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Heart, ShoppingBag, Menu, X, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCommerce } from "@/lib/commerce";
import { useAuth } from "@/context/AuthContext";
import { logoutAction } from "@/app/actions/auth";

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount } = useCommerce();
  const { customer, refreshCustomer } = useAuth();
  const [isSigningOut, startSignOut] = useTransition();

  const handleSignOut = () => {
    startSignOut(async () => {
      await logoutAction();
      await refreshCustomer();
      setIsMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    });
  };

  const displayName = customer
    ? (customer.firstName || customer.email.split("@")[0])
    : null;

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-[60]">
        {/* Main Navbar */}
        <div className="w-full bg-pureblack/85 backdrop-blur-xl px-2 md:px-8 lg:px-12 py-1 flex items-center justify-between transition-colors duration-300 shadow-sm relative">
          {/* Left Navigation */}
          <div className="flex-1 flex items-center justify-start gap-4">
            <button
              aria-label="Menu"
              className="md:hidden p-1 -ml-1 text-purewhite focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5 text-purewhite" />
            </button>
            <nav className="hidden md:flex items-center gap-3.5 lg:gap-6 xl:gap-8 text-sm font-normal tracking-wide lg:tracking-[0.15em] text-purewhite whitespace-nowrap">
              <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
              <Link href="/shop" className="hover:opacity-70 transition-opacity">Shop</Link>
              <Link href="/collections" className="hover:opacity-70 transition-opacity">Collections</Link>
              <Link href="/about" className="hover:opacity-70 transition-opacity">About Us</Link>
            </nav>
          </div>

          {/* Center Logo */}
          <div className="flex-shrink-0 text-center px-2 md:px-4">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] text-purewhite whitespace-nowrap leading-none"
              style={{ fontFamily: 'var(--font-cerkiymo), sans-serif' }}
            >
              modestus
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex-1 flex items-center justify-end gap-3 text-purewhite">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">

              {/* Account / Login */}
              {customer ? (
                <Link
                  href="/account"
                  aria-label="My Account"
                  className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-purewhite/20 hover:bg-purewhite/5 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                    {displayName?.[0]?.toUpperCase()}
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-purewhite text-pureblack text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                    Account
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  aria-label="Login"
                  className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-purewhite/20 hover:bg-purewhite/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-purewhite text-pureblack text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                    Login
                  </span>
                </Link>
              )}

              <Link href="/wishlist" aria-label="Wishlist" className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-purewhite/20 hover:bg-purewhite/5 transition-colors">
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {wishlistCount}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-purewhite text-pureblack text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                  Wishlist
                </span>
              </Link>
              <Link href="/cart" aria-label="Cart" className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-purewhite/20 hover:bg-purewhite/5 transition-colors">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-purewhite text-pureblack text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                  Cart
                </span>
              </Link>
              {/* Right-most Menu Button for Desktop */}
              <button
                aria-label="Menu"
                onClick={() => setIsMobileMenuOpen(true)}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-purewhite/20 hover:bg-purewhite/5 transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-purewhite text-pureblack text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                  Menu
                </span>
              </button>
            </div>

            {/* Mobile Right Icons */}
            <div className="flex md:hidden items-center gap-2 text-purewhite">
              <Link href="/wishlist" aria-label="Wishlist" className="relative flex items-center justify-center w-8 h-8 rounded-full border border-purewhite/20 hover:bg-purewhite/5 transition-colors">
                <Heart className="w-3.5 h-3.5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] font-bold flex items-center justify-center px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" aria-label="Cart" className="relative flex items-center justify-center w-8 h-8 rounded-full border border-purewhite/20 hover:bg-purewhite/5 transition-colors">
                <ShoppingBag className="w-3.5 h-3.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-pureblack/50 z-[70] backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-pureblack z-[80] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-purewhite/10 min-h-[72px]">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl sm:text-4xl text-purewhite leading-none"
                  style={{ fontFamily: 'var(--font-cerkiymo), sans-serif' }}
                >
                  modestus
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-purewhite/20 hover:bg-purewhite/5 transition-colors"
                >
                  <X className="w-5 h-5 text-purewhite" />
                </button>
              </div>

              <div className="flex flex-col overflow-y-auto py-2 flex-1">
                {/* Customer chip */}
                {customer && (
                  <div className="mx-4 mt-3 mb-2 p-3 bg-purewhite/[0.07] rounded-xl border border-purewhite/15 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {displayName?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-purewhite font-bold text-xs truncate">{displayName}</p>
                      <p className="text-purewhite/50 text-[11px] truncate">{customer.email}</p>
                    </div>
                  </div>
                )}

                {[
                  { name: "Home", href: "/" },
                  { name: "Shop", href: "/shop" },
                  { name: "Collections", href: "/collections" },
                  { name: "Wishlist", href: "/wishlist" },
                  { name: "Cart", href: "/cart" },
                  { name: "About Us", href: "/about" },
                  { name: "Contact", href: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-5 py-2.5 md:px-6 md:py-3.5 text-purewhite font-normal text-xs md:text-sm tracking-widest hover:bg-purewhite/5 transition-colors border-b border-purewhite/10"
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Auth links */}
                {customer ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-5 py-2.5 text-purewhite font-normal text-xs tracking-widest hover:bg-purewhite/5 transition-colors border-b border-purewhite/10 flex items-center gap-2.5"
                    >
                      <UserCircle className="w-3.5 h-3.5" />
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="px-5 py-2.5 text-left text-purewhite font-normal text-xs tracking-widest hover:bg-purewhite/5 transition-colors border-b border-purewhite/10 flex items-center gap-2.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-5 py-2.5 text-purewhite font-normal text-xs tracking-widest hover:bg-purewhite/5 transition-colors border-b border-purewhite/10 flex items-center gap-2.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-5 py-2.5 text-purewhite font-normal text-xs tracking-widest hover:bg-purewhite/5 transition-colors border-b border-purewhite/10"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
