"use client";

import { useRef, useState, useEffect } from "react";
import { Star } from "lucide-react";

export default function ReviewSection() {
  const reviews = [
    {
      quote: "Wore the Burgundy Festive Set to my sister's wedding and received so many compliments. The embroidery detail is exquisite. Worth every rupee.",
      initials: "RS",
      name: "Rhea S.",
      info: "Delhi · Burgundy Festive Set",
      avatarColor: "bg-rose-100 text-rose-900"
    },
    {
      quote: "Modestus truly understands fusion wear. It's elegant without being over the top. Perfect for work and weekends.",
      initials: "AK",
      name: "Aisha K.",
      info: "Mumbai · Classic Black Tunic",
      avatarColor: "bg-sky-100 text-sky-900"
    },
    {
      quote: "The quality of the fabric is unmatched. It feels luxurious and comfortable throughout the day. Highly recommended!",
      initials: "SM",
      name: "Sara M.",
      info: "Bangalore · Emerald Green Abaya",
      avatarColor: "bg-emerald-100 text-emerald-900"
    },
    {
      quote: "I've finally found a brand that caters to my style without compromising on modesty. Thank you Modestus!",
      initials: "FZ",
      name: "Fatima Z.",
      info: "Hyderabad · Floral Chiffon Hijab",
      avatarColor: "bg-amber-100 text-amber-900"
    },
    {
      quote: "The customer service was as amazing as the clothes. The fit was perfect right out of the box.",
      initials: "NK",
      name: "Nida K.",
      info: "Pune · Rose Silk Co-ord",
      avatarColor: "bg-indigo-100 text-indigo-900"
    }
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

  // Determine active dot based on scroll progress
  // We'll use 5 dots corresponding to the 5 reviews
  const activeDotIndex = Math.min(
    reviews.length - 1,
    Math.round(scrollProgress * (reviews.length - 1))
  );

  const scrollToDot = (index: number) => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const targetScroll = (index / (reviews.length - 1)) * maxScroll;
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="w-full bg-lightgray py-12 md:py-24 flex flex-col items-center overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      <div className="text-center mb-8 md:mb-12 px-6">
        <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-pureblack/60 mb-2 md:mb-3">
          LOVE LETTERS
        </h4>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-display text-pureblack">
          What Our Community Says
        </h2>
      </div>

      <div className="w-full max-w-[1400px] mx-auto relative">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 md:pb-8 px-6 md:px-12"
        >
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className="bg-purewhite rounded-xl md:rounded-2xl p-6 md:p-8 w-[85vw] sm:w-[350px] md:w-[450px] shadow-sm border border-pureblack/5 shrink-0 snap-center flex flex-col"
            >
              <div className="flex gap-1 mb-4 md:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-3.5 h-3.5 md:w-4 md:h-4 fill-[#C0C0C0] text-[#C0C0C0]" 
                  />
                ))}
              </div>
              
              <p className="font-sans italic text-base sm:text-lg md:text-xl text-pureblack/80 leading-relaxed mb-6 md:mb-8 flex-grow">
                "{review.quote}"
              </p>
              
              <div className="w-full h-px bg-pureblack/10 mb-5 md:mb-6"></div>
              
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base shrink-0 ${review.avatarColor}`}>
                  {review.initials}
                </div>
                <div>
                  <h4 className="font-bold text-pureblack text-sm md:text-base">
                    {review.name}
                  </h4>
                  <p className="text-pureblack/50 text-[10px] sm:text-xs md:text-sm mt-0.5">
                    {review.info}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Dots Pagination */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mt-2 md:mt-4">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToDot(index)}
              className={`rounded-full transition-all duration-300 ${
                activeDotIndex === index 
                  ? "w-6 md:w-8 h-1.5 md:h-2 bg-pureblack" 
                  : "w-1.5 h-1.5 md:w-2 md:h-2 bg-pureblack/20 hover:bg-pureblack/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
