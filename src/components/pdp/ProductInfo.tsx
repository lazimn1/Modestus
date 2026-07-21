"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ShoppingBag, Truck, RotateCcw, Shield } from "lucide-react";
import { type Product, formatINR } from "@/lib/products";
import Link from "next/link";

interface ProductInfoProps {
  product: Product;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${
            star <= Math.floor(rating)
              ? "fill-pureblack text-pureblack"
              : star - 0.5 <= rating
              ? "fill-pureblack/40 text-pureblack/40"
              : "fill-transparent text-pureblack/20"
          }`}
        />
      ))}
    </div>
  );
}

function AccordionItem({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-pureblack/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-bold uppercase tracking-[0.12em] text-pureblack">
          {title}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-4 h-4 text-pureblack/50" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-pureblack/60 leading-relaxed">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 1) {
      // Shake the size selector
      document.getElementById("size-selector")?.classList.add("animate-bounce");
      setTimeout(
        () => document.getElementById("size-selector")?.classList.remove("animate-bounce"),
        600
      );
      return;
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
    >
      {/* Badge */}
      {product.badge && (
        <span className="w-fit bg-pureblack text-purewhite text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1">
          {product.badge}
        </span>
      )}

      {/* Title & Price */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-pureblack/40 font-medium mb-1">
          {product.subtitle}
        </p>
        <h1 className="text-2xl md:text-4xl font-display font-bold text-pureblack tracking-tight leading-tight">
          {product.title}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-2xl font-bold text-pureblack">
            {formatINR(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-base text-pureblack/40 line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
          {product.originalPrice && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
              Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>
        <p className="text-[10px] text-pureblack/40 mt-1">Inclusive of all taxes</p>
      </div>

      {/* Rating */}
      <a
        href="#reviews"
        className="flex items-center gap-2.5 group w-fit"
        aria-label="Jump to reviews"
      >
        <StarRating rating={product.rating} />
        <span className="text-sm font-bold text-pureblack">{product.rating}</span>
        <span className="text-xs text-pureblack/40 group-hover:text-pureblack/70 transition-colors underline underline-offset-2">
          ({product.reviewCount} reviews)
        </span>
      </a>

      {/* Divider */}
      <div className="h-px bg-pureblack/10" />

      {/* Color Selector */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-pureblack/50 mb-3">
          Colour:{" "}
          <span className="text-pureblack">{selectedColor}</span>
        </p>
        <div className="flex gap-2.5 flex-wrap">
          {product.colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              title={color.name}
              aria-label={`Select colour ${color.name}`}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                selectedColor === color.name
                  ? "border-pureblack scale-110 shadow-md"
                  : "border-transparent hover:border-pureblack/30"
              }`}
              style={{
                backgroundColor: color.hex,
                boxShadow: selectedColor === color.name ? `0 0 0 2px white, 0 0 0 4px ${color.hex}` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div id="size-selector">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-pureblack/50">
            Size:{" "}
            <span className="text-pureblack">{selectedSize ?? "Select a size"}</span>
          </p>
          <button className="text-[10px] font-bold uppercase tracking-widest text-pureblack/40 hover:text-pureblack transition-colors underline underline-offset-2">
            Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`min-w-[48px] h-10 px-3 text-xs font-bold tracking-widest uppercase border transition-all duration-200 ${
                selectedSize === size
                  ? "bg-pureblack text-purewhite border-pureblack"
                  : "bg-transparent text-pureblack border-pureblack/20 hover:border-pureblack/60"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {!selectedSize && product.sizes.length > 1 && (
          <p className="text-[10px] text-pureblack/40 mt-2">Please select a size</p>
        )}
      </div>

      {/* Add to Cart */}
      <div className="flex flex-col gap-2">
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 flex items-center justify-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
            addedToCart
              ? "bg-emerald-600 text-white"
              : "bg-pureblack text-purewhite hover:bg-pureblack/80"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {addedToCart ? "Added to Cart!" : "Add to Cart"}
        </motion.button>
        <Link href={`/checkout?productId=${product.id}`} className="w-full py-3.5 border border-pureblack text-pureblack text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-pureblack hover:text-purewhite transition-all duration-300 text-center">
          Buy Now
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 py-4 border-y border-pureblack/10">
        {[
          { icon: Truck, label: "Free Delivery", sub: "Orders above ₹999" },
          { icon: RotateCcw, label: "Easy Returns", sub: "15-day return policy" },
          { icon: Shield, label: "Genuine Products", sub: "100% authentic" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1">
            <Icon className="w-4 h-4 text-pureblack/50" />
            <p className="text-[9px] font-bold uppercase tracking-wide text-pureblack leading-tight">
              {label}
            </p>
            <p className="text-[8px] text-pureblack/40 leading-tight">{sub}</p>
          </div>
        ))}
      </div>

      {/* Accordions */}
      <div>
        <AccordionItem title="Product Description" content={product.description} />
        <AccordionItem title="Fabric & Care" content={product.fabric} />
        <AccordionItem title="Size Guide" content={product.sizeGuide} />
      </div>
    </motion.div>
  );
}
