"use client";

import { Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";
import { useSiteContent } from "@/lib/useSiteContent";

export default function FeaturesBanner() {
  const content = useSiteContent<{ items: { title: string; desc: string }[] }>("features_banner");
  const items = content.items || [
    { title: "FAST DELIVERY", desc: "Quick & wide delivery" },
    { title: "EASY RETURNS", desc: "Within 15 days" },
    { title: "QUALITY ASSURED", desc: "Best fashion, best quality" },
    { title: "SECURE PAYMENT", desc: "100% secure checkout" },
  ];

  const icons = [
    <Truck key="0" className="w-7 h-7 text-pureblack stroke-[1.2]" />,
    <RotateCcw key="1" className="w-7 h-7 text-pureblack stroke-[1.2]" />,
    <ShieldCheck key="2" className="w-7 h-7 text-pureblack stroke-[1.2]" />,
    <Lock key="3" className="w-7 h-7 text-pureblack stroke-[1.2]" />,
  ];

  const features = items.map((item, idx) => ({
    icon: icons[idx] || icons[0],
    title: item.title,
    desc: item.desc,
  }));

  return (
    <section className="w-full bg-slate-100 py-4 md:py-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 md:px-12 grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-6">
        {features.map((feature) => (
          <div 
            key={feature.title} 
            className={`${feature.title === 'SECURE PAYMENT' ? 'hidden md:flex' : 'flex'} flex-col items-center md:items-start text-center md:text-left gap-2 md:flex-row md:gap-4`}
          >
            <div className="shrink-0">{feature.icon}</div>
            <div className="flex flex-col">
              <h4 className="text-pureblack font-bold text-[6px] sm:text-xs md:text-[12px] lg:text-[14px] uppercase tracking-[0.12em] mb-0.5">
                {feature.title}
              </h4>
              <p className="text-pureblack/50 text-[6px] sm:text-xs md:text-sm lg:text-md font-normal">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
