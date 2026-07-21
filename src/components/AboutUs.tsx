"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import MissionSection from "@/components/MissionSection";

export default function AboutUs() {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="w-full bg-pureblack text-purewhite min-h-screen pt-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[90vh] flex items-center justify-center">
        <Image
          src="/about-hero.png"
          alt="Modestus Ethos"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-montserrat text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter"
          >
            THE MODESTUS <br /> ETHOS
          </motion.h1>
        </div>
      </section>

      {/* Mission Section */}
      <MissionSection />

      {/* Pillars Section */}
      <section className="w-full py-20 md:py-32 px-6 md:px-12 border-t border-purewhite/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Pillar 1 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="flex flex-col border-l border-purewhite/20 pl-6"
            >
              <span className="text-purewhite/50 text-xs font-bold tracking-[0.2em] mb-4">01</span>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4">CRAFT</h3>
              <p className="text-purewhite/60 text-xs md:text-sm leading-relaxed">
                We source only premium, durable fabrics that drape flawlessly, ensuring longevity and a luxurious tactile experience.
              </p>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="flex flex-col border-l border-purewhite/20 pl-6"
            >
              <span className="text-purewhite/50 text-xs font-bold tracking-[0.2em] mb-4">02</span>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4">SILHOUETTE</h3>
              <p className="text-purewhite/60 text-xs md:text-sm leading-relaxed">
                Our designs focus on structural interplay and layering, creating forms that are both commanding and profoundly elegant.
              </p>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="flex flex-col border-l border-purewhite/20 pl-6"
            >
              <span className="text-purewhite/50 text-xs font-bold tracking-[0.2em] mb-4">03</span>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4">ESSENCE</h3>
              <p className="text-purewhite/60 text-xs md:text-sm leading-relaxed">
                At our core, we maintain an uncompromising dedication to modesty, proving it is the ultimate form of sophistication.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-purewhite text-pureblack py-20 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-8"
        >
          Construct Your Signature
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Link 
            href="/"
            className="bg-pureblack text-purewhite font-bold uppercase tracking-[0.12em] text-[10px] md:text-xs px-8 py-4 hover:bg-pureblack/90 transition-colors flex items-center gap-2"
          >
            <span>Explore Collections</span>
            <span className="text-sm leading-none">&rarr;</span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
