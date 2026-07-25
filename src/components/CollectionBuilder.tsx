"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";

export default function CollectionBuilder() {
  const content = useSiteContent<{
    heading?: string;
    subtext?: string;
    items?: { name: string; label: string; image: string }[];
  }>("collections");

  const collectionItems = (content.items || [
    { name: "Draped Silk", label: "HIJAB / SCARF", image: "/collection-1.webp" },
    { name: "Structured Noir", label: "ABAYA / OUTERWEAR", image: "/collection-2.webp" },
    { name: "Textured Linen", label: "INNER LAYER", image: "/collection-3.webp" },
    { name: "Modest Essentials", label: "ACCESSORY", image: "/collection-4.webp" },
  ]).map((item, idx) => ({ ...item, id: idx + 1 }));

  return (
    <section className="w-full bg-pureblack text-purewhite py-10 md:py-24 px-4 md:px-12 border-t border-purewhite/10 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-black uppercase tracking-tighter mb-4">
              {content.heading || "OUR COLLECTIONS"}
            </h2>
            <p className="text-purewhite/60 text-xs md:text-base leading-relaxed max-w-md">
              {content.subtext ||
                "Construct your silhouette. Select layers to preview the structural interplay of modest high fashion."}
            </p>
          </div>
        </div>

        {/* Swipeable Grid */}
        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 md:gap-10 pb-8 -mx-4 px-4 md:mx-0 md:px-0 scroll-px-4 md:scroll-px-0">
          {collectionItems.map((item, index) => (
            <div key={item.id} className="flex-none w-[70vw] sm:w-[50vw] md:w-[380px] lg:w-[400px] snap-start group cursor-pointer flex flex-col">
              {/* Header Tab */}
              <div className="flex items-center justify-between border-b border-purewhite/20 pb-4 mb-6">
                <span className="text-purewhite/50 text-[10px] md:text-xs font-medium">0{index + 1}</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em]">{item.label}</span>
              </div>
              
              {/* Image Container */}
              <div className="relative w-full aspect-[3/4] bg-purewhite/5 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 70vw, (max-width: 1024px) 50vw, 400px"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>

              {/* Footer Text */}
              <div className="mt-6">
                <h3 className="text-lg md:text-xl font-bold tracking-tight mb-2 group-hover:text-purewhite/80 transition-colors">
                  {item.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-2 md:mt-12 flex justify-end px-4 md:px-0">
          <Link href="/shop" className="text-purewhite bg-transparent border-none font-bold uppercase tracking-[0.12em] text-[8px] md:text-xs pr-0 pl-6 py-2 md:py-3 hover:text-purewhite/70 transition-colors flex items-center gap-2">
            <span>View More</span>
            <span className="text-sm leading-none">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
