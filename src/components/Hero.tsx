"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const heroImages = [
  { src: "/hero-1.png", extraClasses: "" },
  { src: "/hero-2-cropped.png", extraClasses: "" },
  { src: "/hero-3.png", extraClasses: "" },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroImages.length);
    }, 2500); // switch every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-120 md:h-[95vh] bg-white pt-14 flex flex-col justify-between overflow-hidden">
      
      {/* Huge Background Text & Tagline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 pt-1 md:pt-0 overflow-hidden">
        
        {/* Desktop Tagline (Sits right above the huge text with a fine gap) */}
        <div className="hidden md:block w-full px-12 lg:px-16 mb-2 z-10 pointer-events-auto">
          <h2 className="text-pureblack font-bold uppercase tracking-[0.2em] text-xs lg:text-sm leading-[1.8] max-w-[200px]">
            Fashion <br />
            that moves <br />
            with you.
          </h2>
        </div>

        <h1 
          className="text-[20vw] uppercase tracking-normal leading-none select-none whitespace-nowrap text-orange-800"
          style={{
            fontFamily: 'var(--font-luckiest-guy), "Luckiest Guy", cursive',
            textShadow: `
              1px 1px 0 rgba(0,0,0,0.15),
              2px 2px 0 rgba(0,0,0,0.14),
              3px 3px 0 rgba(0,0,0,0.13),
              4px 4px 0 rgba(0,0,0,0.12),
              5px 5px 0 rgba(0,0,0,0.11),
              6px 6px 0 rgba(0,0,0,0.10),
              7px 7px 0 rgba(0,0,0,0.09),
              8px 8px 0 rgba(0,0,0,0.08),
              9px 9px 0 rgba(0,0,0,0.07),
              10px 10px 0 rgba(0,0,0,0.06),
              12px 12px 4px rgba(0,0,0,0.05),
              15px 15px 8px rgba(0,0,0,0.04),
              20px 20px 15px rgba(0,0,0,0.03)
            `
          }}
        >
          MODESTUS
        </h1>
      </div>

      {/* Model Images - Slide Slideshow */}
      <div className="absolute bottom-0 mb-15 left-1/2 -translate-x-1/2 w-[60%] sm:w-[75%] md:w-[48%] max-w-[650px] h-[80%] sm:h-[75%] md:h-[88%] z-20 pointer-events-none">
        <div className="relative w-full h-full">
          <AnimatePresence initial={false}>
            <motion.div
              key={activeIndex}
              initial={{ x: "100vw" }}
              animate={{ x: 0 }}
              exit={{ x: "-100vw" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[activeIndex].src}
                alt={`Modest fashion model ${activeIndex + 1}`}
                fill
                className={`object-contain object-bottom ${heroImages[activeIndex].extraClasses}`}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={activeIndex === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Realistic Ground Shadow - wide soft ambient shadow beneath model */}
      <div className="absolute bottom-[6rem] left-1/2 -translate-x-1/2 w-[30%] sm:w-[38%] md:w-[28%] h-[10px] sm:h-[14px] md:h-[18px] bg-pureblack/25 rounded-[100%] blur-[12px] sm:blur-[18px] md:blur-[24px] z-19 pointer-events-none" />

      {/* Top Content Row (Mobile Only) */}
      <div className="md:hidden">
        <h2 className="text-pureblack font-bold px-4 sm:px-8 uppercase tracking-[0.2em] text-[10px] sm:text-xs leading-[1.8] max-w-[150px]">
          Fashion <br />
          that moves <br />
          with you.
        </h2>
      </div>


    

      {/* Bottom Content Row */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-2 pb-4 md:pb-16 flex flex-row justify-between items-end mt-auto">
        
        {/* Left Side Buttons */}
        <div className="flex flex-col sm:flex-row items-center mt-8 sm:items-start w-auto gap-4 sm:gap-6">
          <Link
            href="/shop"
            className="w-auto bg-pureblack text-purewhite text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] px-6 py-2.5 md:px-7 md:py-3 text-center hover:bg-pureblack/80 transition-colors shadow-md rounded-xs"
          >
            Shop Now
          </Link>
        </div>


      </div>

    </section>
  );
}
