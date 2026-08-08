"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ShoppingBag, Truck, RotateCcw, Shield, Heart } from "lucide-react";
import { type Product, formatINR } from "@/lib/products";
import Link from "next/link";
import { useCommerce } from "@/lib/commerce";
import { getVariantId } from "@/lib/useProducts";
import { createShopifyCheckout } from "@/lib/shopify/queries";
import { sendGAEvent } from '@next/third-parties/google';
import { Loader2 } from "lucide-react";

interface ProductInfoProps {
  product: Product;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-3.5 h-3.5 sm:w-4 sm:h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${
            star <= Math.floor(rating)
              ? "fill-[#2a2621] text-[#2a2621]"
              : star - 0.5 <= rating
              ? "fill-[#2a2621]/40 text-[#2a2621]/40"
              : "fill-transparent text-[#dad2c2]"
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
    <div className="border-b border-[#e7e1d4]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 sm:py-4 text-left group"
        aria-expanded={open}
      >
        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#2a2621] group-hover:opacity-75 transition-opacity">
          {title}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#78716c]" />
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
            <p className="pb-4 text-sm sm:text-base text-[#78716c] leading-relaxed font-medium">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "Standard Black");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, wishlist, toggleWishlist } = useCommerce();
  const checkoutSize = selectedSize ?? product.sizes?.[0] ?? "One Size";
  const [isRedirecting, setIsRedirecting] = useState(false);

  const wishlisted = wishlist.some((item) => item.productId == product.id);

  useEffect(() => {
    sendGAEvent('event', 'view_item', {
      currency: 'INR',
      value: product.price,
      items: [{
        item_id: product.id.toString(),
        item_name: product.title,
        price: product.price,
        quantity: 1
      }]
    });
  }, [product]);

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
    const vId = getVariantId(product, checkoutSize, selectedColor);
    addToCart({
      productId: product.id,
      variantId: vId,
      quantity: 1,
      size: checkoutSize,
      color: selectedColor,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = async () => {
    if (!selectedSize && product.sizes.length > 1) {
      // Shake the size selector
      document.getElementById("size-selector")?.classList.add("animate-bounce");
      setTimeout(
        () => document.getElementById("size-selector")?.classList.remove("animate-bounce"),
        600
      );
      return;
    }
    
    setIsRedirecting(true);
    try {
      const vId = getVariantId(product, checkoutSize, selectedColor);
      if (!vId) throw new Error("Variant not found");
      
      const checkoutUrl = await createShopifyCheckout([{ merchandiseId: vId, quantity: 1 }]);
      if (checkoutUrl) window.location.href = checkoutUrl;
      else throw new Error("Failed to generate checkout URL.");
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
      setIsRedirecting(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-5 sm:gap-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
    >
      {/* Badge */}
      {product.badge && (
        <span className="w-fit bg-[#2a2621] text-[#faf7f2] rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5">
          {product.badge}
        </span>
      )}

      {/* Title & Price */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#78716c] font-bold mb-1">
            {product.subtitle}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2a2621] font-normal tracking-tight leading-tight">
            {product.title}
          </h1>
        </div>
        
        {/* Wishlist Button */}
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(product.id)}
          className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full border border-[#dad2c2] flex items-center justify-center hover:bg-[#e8e2d5] transition-colors bg-[#faf7f2] mt-1"
        >
          <Heart 
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
              wishlisted ? "fill-[#2a2621] text-[#2a2621]" : "text-[#78716c]"
            }`} 
          />
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
          <span className="text-xl sm:text-2xl font-bold text-[#2a2621]">
            {formatINR(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm sm:text-base text-[#78716c] font-medium line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
          {product.originalPrice && (
            <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">
              Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-[#78716c] font-medium mt-1">Inclusive of all taxes</p>
      </div>

      {/* Rating */}
      <a
        href="#reviews"
        className="flex items-center gap-2 group w-fit"
        aria-label="Jump to reviews"
      >
        <StarRating rating={product.rating} />
        <span className="text-sm sm:text-base font-bold text-[#2a2621]">{product.rating}</span>
        <span className="text-xs sm:text-sm text-[#78716c] font-medium group-hover:text-[#2a2621] transition-colors underline underline-offset-2">
          ({product.reviewCount} reviews)
        </span>
      </a>

      {/* Divider */}
      <div className="h-px bg-[#e7e1d4]" />

      {/* Color Selector */}
      <div>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#78716c] mb-2 sm:mb-3">
          Colour:{" "}
          <span className="text-[#2a2621]">{selectedColor}</span>
        </p>
        <div className="flex gap-2 sm:gap-2.5 flex-wrap">
          {product.colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              title={color.name}
              aria-label={`Select colour ${color.name}`}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                selectedColor === color.name
                  ? "border-[#2a2621] scale-110 shadow-sm"
                  : "border-[#dad2c2] hover:border-[#2a2621]/30"
              }`}
              style={{
                backgroundColor: color.hex,
                boxShadow: selectedColor === color.name ? `0 0 0 2px #faf7f2, 0 0 0 4px ${color.hex}` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div id="size-selector">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#78716c]">
            Size:{" "}
            <span className="text-[#2a2621]">{selectedSize ?? "Select a size"}</span>
          </p>
          <button className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#78716c] hover:text-[#2a2621] transition-colors underline underline-offset-2">
            Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`min-w-[44px] sm:min-w-[52px] h-10 sm:h-12 px-3 text-xs sm:text-sm font-bold tracking-widest uppercase border rounded-full transition-all duration-200 ${
                selectedSize === size
                  ? "bg-[#2a2621] text-[#faf7f2] border-[#2a2621]"
                  : "bg-[#fcfaf7] text-[#2a2621] border-[#dad2c2] hover:border-[#2a2621]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {!selectedSize && product.sizes.length > 1 && (
          <p className="text-xs sm:text-sm text-[#78716c] font-medium mt-2">Please select a size</p>
        )}
      </div>

      {/* Add to Cart */}
      <div className="flex flex-col gap-2.5 mt-2">
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 sm:py-5 rounded-full flex items-center justify-center gap-2 sm:gap-2.5 text-sm sm:text-base font-bold uppercase tracking-widest transition-all duration-300 ${
            addedToCart
              ? "bg-emerald-600 text-white"
              : "bg-[#2a2621] text-[#faf7f2] hover:opacity-90"
          }`}
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          {addedToCart ? "Added to Cart!" : "Add to Cart"}
        </motion.button>
        <button
          onClick={handleBuyNow}
          disabled={isRedirecting}
          className="w-full py-4 sm:py-5 rounded-full border border-[#2a2621] text-[#2a2621] text-sm sm:text-base font-bold uppercase tracking-widest hover:bg-[#e8e2d5] transition-all duration-300 text-center flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              Redirecting...
            </>
          ) : (
            "Buy Now"
          )}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 py-5 sm:py-6 border-y border-[#e7e1d4] mt-2">
        {[
          { icon: Truck, label: "Free Delivery", sub: "Orders above ₹999" },
          { icon: RotateCcw, label: "Easy Returns", sub: "15-day return policy" },
          { icon: Shield, label: "Genuine", sub: "100% authentic" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1.5">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#78716c]" />
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#2a2621] leading-tight mt-1">
              {label}
            </p>
            <p className="text-[10px] sm:text-xs text-[#78716c] font-medium leading-tight">{sub}</p>
          </div>
        ))}
      </div>

      {/* Accordions */}
      <div className="mt-2">
        <AccordionItem title="Product Description" content={product.description} />
        <AccordionItem title="Fabric & Care" content={product.fabric} />
        <AccordionItem title="Size Guide" content={product.sizeGuide} />
      </div>
    </motion.div>
  );
}
