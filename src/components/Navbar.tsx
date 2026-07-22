"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCommerce } from "@/lib/commerce";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount } = useCommerce();

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-[60]">
        {/* Main Navbar */}
        <div className="w-full bg-white/80 backdrop-blur-3xl px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between transition-colors duration-300 shadow-sm relative">
          {/* Left Navigation */}
          <div className="flex-1 flex items-center justify-start gap-4">
            <button
              aria-label="Menu"
              className="md:hidden p-1 -ml-1 text-pureblack focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-pureblack" />
            </button>
            <nav className="hidden md:flex items-center gap-3.5 lg:gap-6 xl:gap-8 text-sm font-normal tracking-wide lg:tracking-[0.15em] text-pureblack whitespace-nowrap">
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
              className="font-montserrat text-xl md:text-2xl xl:text-3xl font-black tracking-[0.05em] text-pureblack uppercase whitespace-nowrap"
            >
              MODESTUS
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex-1 flex items-center justify-end gap-3 text-pureblack">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <Link href="/login" aria-label="Login" className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-pureblack/20 hover:bg-pureblack/5 transition-colors">
                <User className="w-4 h-4" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-pureblack text-purewhite text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                  Login
                </span>
              </Link>
              <Link href="/wishlist" aria-label="Wishlist" className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-pureblack/20 hover:bg-pureblack/5 transition-colors">
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-purewhite text-[9px] font-bold flex items-center justify-center px-1">
                    {wishlistCount}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-pureblack text-purewhite text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                  Wishlist
                </span>
              </Link>
              <Link href="/cart" aria-label="Cart" className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-pureblack/20 hover:bg-pureblack/5 transition-colors">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-purewhite text-[9px] font-bold flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-pureblack text-purewhite text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                  Cart
                </span>
              </Link>
              {/* Right-most Menu Button for Desktop */}
              <button
                aria-label="Menu"
                onClick={() => setIsMobileMenuOpen(true)}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-pureblack/20 hover:bg-pureblack/5 transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-pureblack text-purewhite text-[10px] font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded whitespace-nowrap">
                  Menu
                </span>
              </button>
            </div>

            {/* Mobile Right Icons */}
            <div className="flex md:hidden items-center gap-2 text-pureblack">
              <Link href="/wishlist" aria-label="Wishlist" className="relative flex items-center justify-center w-9 h-9 rounded-full border border-pureblack/20 hover:bg-pureblack/5 transition-colors">
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-purewhite text-[9px] font-bold flex items-center justify-center px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" aria-label="Cart" className="relative flex items-center justify-center w-9 h-9 rounded-full border border-pureblack/20 hover:bg-pureblack/5 transition-colors">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-purewhite text-[9px] font-bold flex items-center justify-center px-1">
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-purewhite z-[80] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-pureblack/10 min-h-[72px]">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-montserrat text-xl font-black tracking-[0.05em] text-pureblack uppercase"
                >
                  MODESTUS
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="p-1 hover:opacity-70 transition-opacity">
                  <X className="w-6 h-6 text-pureblack" />
                </button>
              </div>

              <div className="flex flex-col overflow-y-auto py-2">
                {[
                  { name: "Home", href: "/" },
                  { name: "Shop", href: "/shop" },
                  { name: "Collections", href: "/collections" },
                  { name: "Wishlist", href: "/wishlist" },
                  { name: "Cart", href: "/cart" },
                  { name: "Orders", href: "/orders" },
                  { name: "About Us", href: "/about" },
                  { name: "Contact", href: "/contact" },
                  { name: "Account / Login", href: "/login" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-6 py-4 text-pureblack font-normal text-base tracking-widest hover:bg-pureblack/5 transition-colors border-b border-pureblack/10"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

