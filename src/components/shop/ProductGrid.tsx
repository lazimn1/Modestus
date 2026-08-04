"use client";

import { motion } from "framer-motion";
import { useProducts } from "@/lib/useProducts";
import ProductCard from "./ProductCard";
import { SlidersHorizontal, Loader2 } from "lucide-react";

export default function ProductGrid() {
  const { products, loading } = useProducts();
  return (
    <section className="w-full bg-[#faf7f2] min-h-screen pt-20 md:pt-28 font-sans">
      {/* Page Header */}
      <motion.div
        className="px-4 sm:px-6 md:px-12 pt-6 sm:pt-10 pb-6 sm:pb-8 border-b border-[#e7e1d4]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-[#78716c] mb-1 sm:mb-2">
              Modestus Collection
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2a2621] font-normal tracking-tight">
              All Products
            </h1>
            <p className="text-[#78716c] text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium">
              {products.length} pieces
            </p>
          </div>

          <button className="hidden md:flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#2a2621] border border-[#dad2c2] rounded-full px-5 py-2.5 hover:bg-[#2a2621] hover:text-[#faf7f2] transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter & Sort
          </button>
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-pureblack/50" />
            <p className="text-pureblack/60 text-sm">Loading Modestus Collection...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <div key={product.id}>
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
