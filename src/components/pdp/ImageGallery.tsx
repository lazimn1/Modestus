"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement>(null);

  // Touch swipe state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const goTo = (idx: number) => {
    setActiveIndex(Math.max(0, Math.min(images.length - 1, idx)));
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
    <div className="flex flex-col gap-3 md:sticky md:top-24">
      {/* Main Image */}
      <div
        ref={mainRef}
        className="relative w-full aspect-[3/4] overflow-hidden bg-[#f5f3f0] rounded-sm cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
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
              src={images[activeIndex]}
              alt={`${title} — view ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out"
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      transform: "scale(1.6)",
                    }
                  : {}
              }
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom Hint */}
        {!isZoomed && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-purewhite/80 backdrop-blur-sm text-pureblack/60 text-[9px] font-bold uppercase tracking-widest px-2 py-1">
            <ZoomIn className="w-3 h-3" />
            Hover to zoom
          </div>
        )}

        {/* Nav Arrows (mobile) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purewhite/80 rounded-full flex items-center justify-center disabled:opacity-30"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-pureblack" />
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === images.length - 1}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purewhite/80 rounded-full flex items-center justify-center disabled:opacity-30"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-pureblack" />
            </button>
          </>
        )}

        {/* Dot indicators (mobile) */}
        {images.length > 1 && (
          <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-5 h-1.5 bg-pureblack" : "w-1.5 h-1.5 bg-pureblack/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails (desktop) */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Select image ${i + 1}`}
              className={`relative w-16 h-20 shrink-0 overflow-hidden rounded-sm transition-all duration-300 ${
                i === activeIndex
                  ? "ring-2 ring-pureblack ring-offset-1"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
