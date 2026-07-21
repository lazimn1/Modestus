"use client";

import { motion } from "framer-motion";
import { products } from "@/lib/products";
import ProductCard from "./ProductCard";
import { SlidersHorizontal } from "lucide-react";

export default function ProductGrid() {
  return (
    <section className="w-full bg-lightgray min-h-screen">
      {/* Page Header */}
      <motion.div
        className="px-6 md:px-12 pt-10 pb-8 border-b border-pureblack/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-pureblack/40 mb-2">
              Modestus Collection
            </p>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-pureblack tracking-tight">
              All Products
            </h1>
            <p className="text-pureblack/50 text-sm mt-2">
              {products.length} pieces
            </p>
          </div>

          <button className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-pureblack border border-pureblack/20 px-4 py-2.5 hover:bg-pureblack hover:text-purewhite transition-all duration-300">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter & Sort
          </button>
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((product, index) => (
            <div key={product.id}>
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
