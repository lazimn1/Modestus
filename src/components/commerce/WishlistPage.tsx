"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/products";
import { getDefaultVariant, useCommerce } from "@/lib/commerce";

export default function WishlistPage() {
  const {
    wishlistProducts,
    removeFromWishlist,
    addToCart,
  } = useCommerce();

  return (
    <main className="min-h-screen bg-[#faf7f2] pt-24 md:pt-36 pb-24 font-sans">
      <section className="px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-8 border-b border-[#e7e1d4]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-[#78716c]">
                Saved pieces
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2a2621] font-normal tracking-tight mt-3">
                Wishlist
              </h1>
              <p className="text-xs sm:text-sm text-[#78716c] mt-2 font-medium">
                {wishlistProducts.length}{" "}
                {wishlistProducts.length === 1 ? "piece" : "pieces"} saved for later
              </p>
            </div>
            <Link
              href="/cart"
              className="w-fit text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-[#dad2c2] rounded-full px-5 py-2.5 sm:py-3 hover:bg-[#2a2621] hover:text-[#faf7f2] transition-colors text-[#2a2621]"
            >
              View Cart
            </Link>
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="min-h-[55vh] flex items-center justify-center text-center mt-8 bg-[#fcfaf7] border border-[#e7e1d4] rounded-2xl sm:rounded-3xl p-8">
              <div className="max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#e8e2d5] flex items-center justify-center mb-5 border border-[#dad2c2]/50">
                  <Heart className="w-7 h-7 text-[#78716c]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-[#2a2621] font-normal">
                  Nothing saved yet
                </h2>
                <p className="text-xs sm:text-sm text-[#78716c] mt-2 font-medium leading-relaxed">
                  Tap the heart on any product to build a considered wishlist.
                </p>
                <Link
                  href="/shop"
                  className="mt-8 bg-[#2a2621] text-[#faf7f2] text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full px-8 py-3.5 inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Browse Shop
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pt-8">
              {wishlistProducts.map((product) => {
                const variant = getDefaultVariant(product);

                return (
                  <article
                    key={product.id}
                    className="bg-[#fcfaf7] border border-[#e7e1d4] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col"
                  >
                    <Link
                      href={`/shop/${product.slug}`}
                      className="relative aspect-[3/4] overflow-hidden bg-[#e8e2d5] border-b border-[#dad2c2]/50 group"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-[#2a2621] text-[#faf7f2] text-[8px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full">
                          {product.badge}
                        </span>
                      )}
                    </Link>
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="min-w-0">
                          <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#78716c] font-semibold truncate mb-1">
                            {product.subtitle}
                          </p>
                          <Link
                            href={`/shop/${product.slug}`}
                            className="block text-sm sm:text-base font-bold text-[#2a2621] leading-tight hover:opacity-75 transition-opacity"
                          >
                            {product.title}
                          </Link>
                        </div>
                        <button
                          aria-label={`Remove ${product.title} from wishlist`}
                          onClick={() => removeFromWishlist(product.id)}
                          className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full flex items-center justify-center hover:bg-[#e8e2d5] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#78716c]" />
                        </button>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-[#2a2621] mt-2 sm:mt-3">{formatINR(product.price)}</p>
                      
                      <div className="mt-4 sm:mt-5 grid grid-cols-[1fr_40px] sm:grid-cols-[1fr_44px] gap-2">
                        <button
                          onClick={() => {
                            addToCart({
                              productId: product.id,
                              quantity: 1,
                              size: variant.size,
                              color: variant.color,
                            });
                            removeFromWishlist(product.id);
                          }}
                          className="h-10 sm:h-11 bg-[#2a2621] text-[#faf7f2] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity"
                        >
                          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Move to Cart
                        </button>
                        <Link
                          href={`/shop/${product.slug}`}
                          aria-label={`View ${product.title}`}
                          className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-[#dad2c2] flex items-center justify-center hover:bg-[#e8e2d5] transition-colors text-[#2a2621]"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
