"use client";

import { motion } from "framer-motion";
import { Search, ShoppingBag, Menu } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-alabaster/70 border-b border-obsidian/5"
    >
      <div className="flex items-center gap-6">
        <button aria-label="Menu" className="md:hidden">
          <Menu className="w-6 h-6 text-obsidian" />
        </button>
        <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
          <Link href="/collections" className="hover:text-obsidian/70 transition-colors">
            COLLECTIONS
          </Link>
          <Link href="/new-arrivals" className="hover:text-obsidian/70 transition-colors">
            NEW ARRIVALS
          </Link>
          <Link href="/about" className="hover:text-obsidian/70 transition-colors">
            ABOUT
          </Link>
        </nav>
      </div>

      <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-display text-2xl font-bold tracking-widest text-obsidian uppercase">
        Modestus
      </Link>

      <div className="flex items-center gap-6">
        <button aria-label="Search" className="hidden md:block">
          <Search className="w-5 h-5 text-obsidian hover:text-obsidian/70 transition-colors" />
        </button>
        <button aria-label="Cart" className="relative group">
          <ShoppingBag className="w-5 h-5 text-obsidian group-hover:text-obsidian/70 transition-colors" />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-obsidian text-[10px] text-alabaster">
            0
          </span>
        </button>
      </div>
    </motion.header>
  );
}
