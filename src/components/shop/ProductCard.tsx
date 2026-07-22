"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { type Product, formatINR } from "@/lib/products";
import { Heart, ShoppingBag } from "lucide-react";
import { getDefaultVariant, useCommerce } from "@/lib/commerce";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart } = useCommerce();
  const wishlisted = wishlist.some((item) => item.productId === product.id);
  const defaultVariant = getDefaultVariant(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <motion.div
          className="relative overflow-hidden bg-[#fcfaf7] border border-[#e7e1d4] rounded-xl sm:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
        >
          {/* Image Container */}
          <div className="relative w-full overflow-hidden aspect-[3/4] bg-[#e8e2d5] border-b border-[#dad2c2]/50">
            {/* Primary Image */}
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10">
                <span className="bg-[#2a2621] text-[#faf7f2] rounded-full text-[6px] md:text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 whitespace-nowrap">
                  {product.badge}
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              className="absolute top-2 md:top-3 right-2 md:right-3 z-10 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#fcfaf7]/90 border border-[#dad2c2]/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-[#e8e2d5]"
            >
              <Heart
                className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-colors duration-300 ${wishlisted ? "fill-[#2a2621] text-[#2a2621]" : "text-[#78716c]"}`}
              />
            </button>

            <button
              aria-label={`Add ${product.title} to cart`}
              onClick={(e) => {
                e.preventDefault();
                addToCart({
                  productId: product.id,
                  quantity: 1,
                  size: defaultVariant.size,
                  color: defaultVariant.color,
                });
              }}
              className="absolute bottom-2 md:bottom-3 right-2 md:right-3 z-10 w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#2a2621] border border-[#2a2621] text-[#faf7f2] flex items-center justify-center transition-all duration-300 hover:opacity-90"
            >
              <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-1 xl:gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] md:text-[9px] uppercase tracking-wider text-[#78716c] font-semibold mb-0.5 truncate">
                  {product.subtitle}
                </p>
                <h3 className="text-xs md:text-sm font-bold text-[#2a2621] tracking-wide leading-tight truncate">
                  {product.title}
                </h3>
              </div>
              <div className="text-left xl:text-right shrink-0 mt-0.5 xl:mt-0">
                {product.originalPrice && (
                  <p className="text-[8px] md:text-[9px] text-[#78716c] font-medium line-through leading-none mb-0.5 sm:mb-1 whitespace-nowrap">
                    {formatINR(product.originalPrice)}
                  </p>
                )}
                <p className="text-xs md:text-sm font-bold text-[#2a2621] leading-none whitespace-nowrap">
                  {formatINR(product.price)}
                </p>
              </div>
            </div>

            {/* Color dots */}
            <div className="flex gap-1.5 mt-2.5 sm:mt-3">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color.name}
                  title={color.name}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-[#dad2c2] shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[8px] sm:text-[9px] text-[#78716c] font-medium self-center">
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
