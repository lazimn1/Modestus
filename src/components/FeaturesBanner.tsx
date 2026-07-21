import { Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";

export default function FeaturesBanner() {
  const features = [
    {
      icon: <Truck className="w-7 h-7 text-pureblack stroke-[1.2]" />,
      title: "FAST DELIVERY",
      desc: "Quick & wide delivery",
    },
    {
      icon: <RotateCcw className="w-7 h-7 text-pureblack stroke-[1.2]" />,
      title: "EASY RETURNS",
      desc: "Within 15 days",
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-pureblack stroke-[1.2]" />,
      title: "QUALITY ASSURED",
      desc: "Best fashion, best quality",
    },
    {
      icon: <Lock className="w-7 h-7 text-pureblack stroke-[1.2]" />,
      title: "SECURE PAYMENT",
      desc: "100% secure checkout",
    },
  ];

  return (
    <section className="w-full bg-slate-100 py-4 md:py-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 md:px-12 grid grid-cols-4 gap-2 md:gap-6">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col items-center md:items-start text-center md:text-left gap-2 md:flex-row md:gap-4">
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
