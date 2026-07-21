"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type Product, formatINR } from "@/lib/products";
import { Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <motion.div
          className="relative overflow-hidden bg-purewhite rounded-sm"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {/* Image Container */}
          <div className="relative w-full overflow-hidden aspect-[3/4]">
            {/* Primary Image */}
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10">
                <span className="bg-pureblack text-purewhite text-[6px] md:text-[9px] font-bold uppercase tracking-[0.05em] md:tracking-[0.15em] px-1.5 md:px-2.5 py-0.5 md:py-1 whitespace-nowrap">
                  {product.badge}
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              aria-label="Add to wishlist"
              onClick={(e) => {
                e.preventDefault();
                setWishlisted(!wishlisted);
              }}
              className="absolute top-2 md:top-3 right-2 md:right-3 z-10 w-5 h-5 md:w-8 md:h-8 rounded-full bg-purewhite/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-purewhite"
            >
              <Heart
                className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 transition-colors duration-300 ${wishlisted ? "fill-pureblack text-pureblack" : "text-pureblack/60"}`}
              />
            </button>
          </div>

          {/* Info */}
          <div className="px-3 py-3">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-1 xl:gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] md:text-[9px] uppercase tracking-[0.15em] md:tracking-[0.18em] text-pureblack/40 font-medium mb-0.5 truncate">
                  {product.subtitle}
                </p>
                <h3 className="text-xs md:text-sm font-bold text-pureblack tracking-wide leading-tight truncate">
                  {product.title}
                </h3>
              </div>
              <div className="text-left xl:text-right shrink-0 mt-0.5 xl:mt-0">
                {product.originalPrice && (
                  <p className="text-[8px] md:text-[9px] text-pureblack/40 line-through leading-none mb-0.5 whitespace-nowrap">
                    {formatINR(product.originalPrice)}
                  </p>
                )}
                <p className="text-xs md:text-sm font-bold text-pureblack leading-none whitespace-nowrap">
                  {formatINR(product.price)}
                </p>
              </div>
            </div>

            {/* Color dots */}
            <div className="flex gap-1.5 mt-2.5">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color.name}
                  title={color.name}
                  className="w-3 h-3 rounded-full border border-pureblack/15 shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[8px] text-pureblack/40 self-center">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
