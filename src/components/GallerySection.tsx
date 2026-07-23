"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

export default function GallerySection() {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="w-full bg-lightgray py-16 md:py-32 px-4 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 md:gap-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 px-2 md:px-0">
          <div>
            <motion.h2 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              className="text-3xl md:text-5xl lg:text-6xl font-montserrat font-black uppercase tracking-tighter text-pureblack"
            >
              Editorial
            </motion.h2>
          </div>
          <motion.p 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="text-[10px] md:text-xs text-pureblack/60 max-w-xs md:text-right font-bold uppercase tracking-[0.1em]"
          >
            A visual exploration of structure, drape, and modern modesty.
          </motion.p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[150px] sm:auto-rows-[200px] md:auto-rows-[300px]">
          {/* Image 1: Large (Mobile: 2 cols x 2 rows | Desktop: 2 cols x 2 rows) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative col-span-2 row-span-2 md:col-span-2 md:row-span-2 overflow-hidden group bg-pureblack"
          >
            <Image 
              src="/gallery-img-1.webp"
              alt="Editorial Shot 1"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95"
            />
          </motion.div>

          {/* Image 2: Tall (Mobile: 1 col x 1 row | Desktop: 1 col x 2 rows) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative col-span-1 row-span-1 md:col-span-1 md:row-span-2 overflow-hidden group bg-pureblack"
          >
            <Image 
              src="/gallery-img-2.webp"
              alt="Editorial Shot 2"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95"
            />
          </motion.div>

          {/* Image 3: Small Top (Mobile: 1 col x 1 row | Desktop: 1 col x 1 row) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative col-span-1 row-span-1 md:col-span-1 md:row-span-1 overflow-hidden group bg-pureblack"
          >
            <Image 
              src="/gallery-img-3.webp"
              alt="Editorial Shot 3"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95"
            />
          </motion.div>

          {/* Image 4: Small Bottom (Mobile: 2 cols x 1 row | Desktop: 1 col x 1 row) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative col-span-2 row-span-1 md:col-span-1 md:row-span-1 overflow-hidden group bg-pureblack"
          >
            <Image 
              src="/gallery-img-4.webp"
              alt="Editorial Shot 4"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
