"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";

export default function CategorySection() {
  const content = useSiteContent<{
    items?: {
      title: string;
      description: string;
      linkText: string;
      linkUrl: string;
      imageUrl: string;
    }[];
  }>("categories");

  const categories = content.items || [
    {
      title: "ABAYAS",
      description: "Elegant and modest daily wear.",
      linkText: "SHOP ABAYAS",
      linkUrl: "/abayas",
      imageUrl: "/images/category-1.webp",
    },
    {
      title: "HIJABS",
      description: "Premium quality for every style.",
      linkText: "SHOP HIJABS",
      linkUrl: "/hijabs",
      imageUrl: "/images/category-2.webp",
    },
    {
      title: "DRESSES",
      description: "Beautifully crafted modest dresses.",
      linkText: "SHOP DRESSES",
      linkUrl: "/dresses",
      imageUrl: "/images/category-3.webp",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  return (
    <section className="w-full bg-pureblack text-purewhite py-2 md:py-14 px-6 md:px-12">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-w-7xl mx-auto flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 md:pb-0"
      >
        {categories.map((category) => (
          <div key={category.title} className="flex items-center gap-4 md:gap-5 group cursor-pointer shrink-0 snap-start w-[70%] sm:w-[50%] md:w-auto">
            <div className="relative w-[56px] h-[72px] md:w-[80px] md:h-[100px] overflow-hidden shrink-0">
              <Image
                src={category.imageUrl}
                alt={category.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex flex-col items-start justify-center">
              <h3 className="text-xs md:text-xl font-bold uppercase tracking-[0.15em] mb-1.5">
                {category.title}
              </h3>
              <p className="text-purewhite/60 text-[9px] md:text-xs font-normal leading-relaxed mb-3 md:mb-5 max-w-[160px] lowercase first-letter:uppercase">
                {category.description}
              </p>
              <Link
                href={category.linkUrl}
                className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.12em] border-b border-purewhite/40 pb-0.5 hover:border-purewhite transition-colors flex items-center gap-1.5"
              >
                <span>{category.linkText}</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Pagination Line */}
      <div className="mt-4 flex md:hidden items-center justify-center">
        <div className="h-[2px] w-32 sm:w-48 bg-purewhite/20 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-purewhite"
            style={{ 
              width: `${100 / categories.length}%`,
              transform: `translateX(${scrollProgress * (categories.length - 1) * 100}%)`
            }}
          />
        </div>
      </div>
    </section>
  );
}
