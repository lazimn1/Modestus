"use client";

import { motion, Variants } from "framer-motion";

export default function MissionSection() {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="w-full bg-purewhite text-pureblack py-20 md:py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-2xl md:text-4xl lg:text-5xl font-display font-black uppercase tracking-tighter mb-8 md:mb-12"
        >
          About Us
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-sm md:text-base text-pureblack/70 leading-relaxed max-w-2xl mx-auto"
        >
          We believe that modesty is not a limitation, but a canvas for architectural elegance. Every piece is constructed to empower the wearer, blending uncompromising coverage with high-fashion structural design.
        </motion.p>
      </div>
    </section>
  );
}
