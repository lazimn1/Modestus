"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  const customEase = [0.76, 0, 0.24, 1] as const;

  return (
    <section className="relative w-full min-h-[100dvh] bg-[#F9F9F9] flex flex-col items-center justify-center py-12 px-4">
      
      {/* Top Typography */}
      <motion.h1
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: customEase }}
        className="relative z-10 text-[20vw] sm:text-[18vw] md:text-[14vw] leading-none font-display font-semibold text-[#D4D4D4] uppercase tracking-tighter shrink-0"
      >
        MODEST
      </motion.h1>

      {/* Central Media Portal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: customEase, delay: 0.2 }}
        className="relative z-20 w-[95%] sm:w-[90%] max-w-[800px] h-[45dvh] sm:h-[50dvh] md:h-[60dvh] overflow-hidden rounded-lg sm:rounded-xl shadow-2xl -my-3 sm:-my-5 md:-my-8 shrink-0"
      >
        <Image
          src="https://lh3.googleusercontent.com/aida/AP1WRLtBRltqBLp2TSOia_v1osQzUl3PSlugnrVUt1jaHtEEtSJB24oOHb6PtyDuK60Umt3i4BJASJdpO8OjzqmFYO3QWcHp2gZLMDfyY6oemlXS2n82hgZMeAPa1jKYVVFZ_Rcpv5TheQ_CxmKOqFYA-c47TnH5a7n0ZZFexNfypSJUtzn8XIDbbl5vQjjwN44xwBC1Y0TzxaWWy-Ghx5FCMjpJc1rsVHtYNBx6Z5oaJ6VDkXSbbJI-GqTWPG0"
          alt="Modest fashion editorial main"
          fill
          className="object-cover"
          priority
          unoptimized={true}
        />
        
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Text inside image */}
        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 flex flex-col items-start gap-1 sm:gap-1.5 md:gap-2">
          <span className="text-[#DEB887] text-[9px] sm:text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em] font-medium">
            The Essence of Elegance
          </span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-5xl font-display font-bold tracking-tight">
            Timeless Modesty
          </h2>
          <button className="mt-1.5 sm:mt-2 md:mt-3 flex items-center gap-2 text-white text-[11px] sm:text-xs md:text-sm font-mono font-medium hover:text-white/70 transition-colors active:scale-95 text-left">
            <span>Explore Collection</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Bottom Typography */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: customEase, delay: 0.1 }}
        className="relative z-10 text-[20vw] sm:text-[18vw] md:text-[14vw] leading-none font-display font-semibold text-[#D4D4D4] uppercase tracking-tighter shrink-0"
      >
        US
      </motion.h1>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-6 flex flex-col items-center gap-1 z-20 text-[#111]"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </motion.div>

    </section>
  );
}
