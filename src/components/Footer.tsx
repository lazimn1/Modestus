"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";

const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

export default function Footer() {
  const content = useSiteContent<{
    description?: string;
    instagram?: string;
    twitter?: string;
  }>("footer");

  const exploreLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
    { label: "Orders", href: "/orders" },
    { label: "Our Story", href: "/about" },
  ];

  return (
    <footer className="w-full bg-pureblack text-purewhite py-10 md:py-16 px-6 md:px-12 border-t border-purewhite/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
        
        {/* Brand & Newsletter Section */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <h2 className="text-xl md:text-3xl font-display font-bold tracking-widest uppercase">
            Modestus
          </h2>
          <p className="text-purewhite/70 text-xs md:text-base max-w-sm whitespace-pre-line">
            {content.description ||
              "Join our community to receive exclusive updates on new collections and minimal modest fashion insights."}
          </p>
        </div>

        {/* Links & Socials Section */}
        <div className="w-full md:w-1/2 flex flex-col sm:flex-row justify-between gap-10 md:gap-4 lg:pl-16">
          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[8px] md:text-xs font-bold uppercase tracking-[0.2em] text-purewhite/50 mb-2">
              Explore
            </h4>
            {exploreLinks.map((link) => (
              <Link 
                key={link.label} 
                href={link.href}
                className="text-xs md:text-base text-purewhite transition-colors w-fit"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[8px] md:text-xs font-bold uppercase tracking-[0.2em] text-purewhite/50 mb-2">
              Connect
            </h4>
            <div className="flex gap-4 md:gap-5">
              <a href={content.instagram || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-full border border-purewhite/20 flex items-center justify-center transition-all duration-300">
                  <Instagram className="w-3 h-3 md:w-4 md:h-4" />
                </div>
              </a>
              <a href={content.twitter || "#"} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-full border border-purewhite/20 flex items-center justify-center transition-all duration-300">
                  <Twitter className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                </div>
              </a>
            </div>
            <p className="text-purewhite/40 text-[8px] md:text-xs mt-4">
              © {new Date().getFullYear()} Modestus. <br /> All rights reserved.
            </p>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
