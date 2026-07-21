"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-[60]">
        {/* Main Navbar */}
        <div className="w-full bg-white/60 backdrop-blur-3xl px-6 py-4 md:px-12 flex items-center justify-between transition-colors duration-300 hover:bg-purewhite/90">
          {/* Left Navigation */}
          <div className="flex items-center gap-6">
            <button
              aria-label="Menu"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-pureblack" />
            </button>
            <nav className="hidden md:flex gap-6 text-[11px] font-bold tracking-[0.15em] uppercase text-pureblack">
              <Link href="/shop" className="hover:opacity-70 transition-opacity">Shop</Link>
              <Link href="/collections" className="hover:opacity-70 transition-opacity">Collections</Link>
              <Link href="/about" className="hover:opacity-70 transition-opacity">Our Story</Link>
              <Link href="/contact" className="hover:opacity-70 transition-opacity">Contact</Link>
            </nav>
          </div>

          {/* Center Logo */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute left-1/2 -translate-x-1/2 font-montserrat text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.05em] text-pureblack uppercase"
          >
            MODESTUS
          </Link>

          {/* Right Icons */}
          <div className="hidden md:flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.12em] text-pureblack">
            <button aria-label="Search" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <Link href="/login" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
              <User className="w-4 h-4" />
              <span>Login</span>
            </Link>
            <Link href="/wishlist" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </Link>
            <button aria-label="Cart" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
              <ShoppingBag className="w-4 h-4" />
              <span>Cart On</span>
            </button>
          </div>

          {/* Mobile Right Icons */}
          <div className="flex md:hidden items-center gap-4 text-pureblack">
            <button aria-label="Cart" className="relative">
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-pureblack/50 z-[70] md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-purewhite z-[80] flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-pureblack/10 min-h-[72px]">
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="p-1">
                  <X className="w-6 h-6 text-pureblack" />
                </button>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-montserrat text-2xl font-black tracking-[0.05em] text-pureblack uppercase"
                >
                  MODESTUS
                </Link>
              </div>

              <div className="flex flex-col overflow-y-auto">
                {[
                  { name: "Shop", href: "/shop" },
                  { name: "Collections", href: "/collections" },
                  { name: "Our Story", href: "/about" },
                  { name: "Contact", href: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-6 py-4 text-pureblack font-bold text-sm uppercase tracking-widest hover:bg-pureblack/5 transition-colors border-b border-pureblack/10"
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
