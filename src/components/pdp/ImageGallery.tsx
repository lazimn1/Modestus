"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const safeImages = (images && images.length > 0) ? images : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80"];
  const [activeIndex, setActiveIndex] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  // Touch swipe state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const goTo = (idx: number) => {
    setActiveIndex(Math.max(0, Math.min(safeImages.length - 1, idx)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(activeIndex + 1);
      else goTo(activeIndex - 1);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:sticky md:top-32">
      {/* Main Image */}
      <div
        ref={mainRef}
        className="relative w-full aspect-[3/4] overflow-hidden bg-[#e8e2d5] border border-[#dad2c2]/50 rounded-xl sm:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src={safeImages[activeIndex]}
              alt={`${title} — view ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out"
            />
          </motion.div>
        </AnimatePresence>

        {/* Nav Arrows (mobile) */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="md:hidden absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#fcfaf7]/90 border border-[#dad2c2]/50 rounded-full flex items-center justify-center disabled:opacity-30 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#2a2621]" />
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === safeImages.length - 1}
              className="md:hidden absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#fcfaf7]/90 border border-[#dad2c2]/50 rounded-full flex items-center justify-center disabled:opacity-30 backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#2a2621]" />
            </button>
          </>
        )}

        {/* Dot indicators (mobile) */}
        {safeImages.length > 1 && (
          <div className="md:hidden absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
            {safeImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-4 h-1 sm:w-5 sm:h-1.5 bg-[#2a2621]" : "w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#2a2621]/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails (desktop) */}
      {safeImages.length > 1 && (
        <div className="hidden md:flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Select image ${i + 1}`}
              className={`relative w-20 h-24 shrink-0 overflow-hidden rounded-lg sm:rounded-xl border transition-all duration-300 bg-[#e8e2d5] ${
                i === activeIndex
                  ? "border-[#2a2621] opacity-100 shadow-md"
                  : "border-[#dad2c2]/50 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
