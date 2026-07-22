"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/products";
import { useCommerce, type CartLine } from "@/lib/commerce";

function QuantityStepper({ line }: { line: CartLine }) {
  const { updateQuantity } = useCommerce();

  return (
    <div className="grid grid-cols-[32px_36px_32px] sm:grid-cols-[36px_42px_36px] h-8 sm:h-9 border border-[#dad2c2] rounded-full overflow-hidden bg-[#fcfaf7]">
      <button
        aria-label={`Decrease quantity for ${line.product.title}`}
        onClick={() => updateQuantity(line, line.quantity - 1)}
        className="flex items-center justify-center hover:bg-[#e8e2d5] transition-colors text-[#2a2621]"
      >
        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
      <span className="flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#2a2621]">
        {line.quantity}
      </span>
      <button
        aria-label={`Increase quantity for ${line.product.title}`}
        onClick={() => updateQuantity(line, line.quantity + 1)}
        className="flex items-center justify-center hover:bg-[#e8e2d5] transition-colors text-[#2a2621]"
      >
        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
}

export default function CartPage() {
  const { cartLines, cartCount, subtotal, shipping, total, removeFromCart } =
    useCommerce();

  return (
    <main className="min-h-screen bg-[#faf7f2] pt-24 md:pt-36 pb-24 font-sans">
      <section className="px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 pb-8 border-b border-[#e7e1d4]">
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-[#78716c]">
              Your edit
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2a2621] font-normal tracking-tight">
                  Shopping Cart
                </h1>
                <p className="text-xs sm:text-sm text-[#78716c] mt-2 font-medium">
                  {cartCount} {cartCount === 1 ? "piece" : "pieces"} selected
                </p>
              </div>
              <Link
                href="/shop"
                className="w-fit text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-[#dad2c2] rounded-full px-5 py-2.5 sm:py-3 hover:bg-[#2a2621] hover:text-[#faf7f2] transition-colors text-[#2a2621]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {cartLines.length === 0 ? (
            <div className="min-h-[55vh] flex items-center justify-center text-center mt-8 bg-[#fcfaf7] border border-[#e7e1d4] rounded-2xl sm:rounded-3xl p-8">
              <div className="max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#e8e2d5] flex items-center justify-center mb-5 border border-[#dad2c2]/50">
                  <ShoppingBag className="w-7 h-7 text-[#78716c]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-[#2a2621] font-normal">Your cart is empty</h2>
                <p className="text-xs sm:text-sm text-[#78716c] mt-2 font-medium leading-relaxed">
                  Build a look from the shop and your selected pieces will appear here.
                </p>
                <Link
                  href="/shop"
                  className="mt-8 bg-[#2a2621] text-[#faf7f2] text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full px-8 py-3.5 inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Shop Collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 pt-8">
              <div className="flex flex-col gap-4">
                {cartLines.map((line) => (
                  <article
                    key={`${line.productId}-${line.size}-${line.color}`}
                    className="bg-[#fcfaf7] border border-[#e7e1d4] rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] gap-4 sm:gap-6 p-4 sm:p-5"
                  >
                    <Link
                      href={`/shop/${line.product.slug}`}
                      className="relative aspect-square sm:aspect-[3/4] rounded-xl overflow-hidden bg-[#e8e2d5] border border-[#dad2c2]/50 shrink-0"
                    >
                      <Image
                        src={line.product.images[0]}
                        alt={line.product.title}
                        fill
                        sizes="(max-width: 640px) 80px, (max-width: 768px) 120px, 140px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex flex-col justify-between py-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-wider text-[#78716c] font-semibold truncate mb-1">
                            {line.product.subtitle}
                          </p>
                          <Link
                            href={`/shop/${line.product.slug}`}
                            className="block text-sm sm:text-base md:text-lg font-bold text-[#2a2621] leading-tight hover:opacity-75 transition-opacity"
                          >
                            {line.product.title}
                          </Link>
                          <p className="text-[10px] sm:text-xs text-[#78716c] mt-1.5 font-medium">
                            {line.color} / {line.size}
                          </p>
                        </div>
                        <button
                          aria-label={`Remove ${line.product.title}`}
                          onClick={() => removeFromCart(line)}
                          className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-[#e8e2d5] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#78716c]" />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                        <QuantityStepper line={line} />
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] sm:text-xs text-[#78716c] font-medium hidden sm:block">
                            {formatINR(line.product.price)} each
                          </p>
                          <p className="text-xs sm:text-base font-bold text-[#2a2621] mt-0.5 sm:mt-1">
                            {formatINR(line.product.price * line.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="lg:sticky lg:top-28 h-fit bg-[#fcfaf7] border border-[#e7e1d4] rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 sm:p-8">
                <h2 className="font-serif text-xl sm:text-2xl text-[#2a2621] font-normal tracking-tight">Order Summary</h2>
                <div className="flex flex-col gap-4 text-xs sm:text-sm mt-6 text-[#78716c] font-medium">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
                  </div>
                  <div className="h-px bg-[#e7e1d4] my-1" />
                  <div className="flex justify-between items-center font-bold text-[#2a2621]">
                    <span className="text-sm sm:text-base">Total</span>
                    <span className="text-base sm:text-lg">{formatINR(total)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="mt-8 w-full bg-[#2a2621] text-[#faf7f2] h-12 sm:h-14 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Checkout
                </Link>
                <p className="text-[9px] sm:text-[10px] text-[#78716c] text-center mt-4 font-medium px-4">
                  Free delivery above Rs. 999. Returns accepted within 15 days.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
