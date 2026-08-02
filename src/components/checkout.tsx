"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCommerce, type CartItem } from "@/lib/commerce";
import { formatINR, products as defaultProducts } from "@/lib/products";
import { useProducts, getVariantId } from "@/lib/useProducts";
import { createShopifyCheckout } from "@/lib/shopify/queries";
import { Lock, ShoppingBag, Loader2 } from "lucide-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("productId");
  
  const { cart, cartLines } = useCommerce();
  const { products, loading: productsLoading } = useProducts();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirectBuy = Boolean(productIdParam);
  const directProduct = products.find((p) => p.id === Number(productIdParam)) || products[0];

  const checkoutItems: CartItem[] = isDirectBuy && directProduct
    ? [
        {
          productId: directProduct.id,
          variantId: directProduct.shopifyVariants?.[0]?.id,
          quantity: 1,
          size: directProduct.sizes[0],
          color: directProduct.colors[0].name,
          addedAt: new Date().toISOString(),
        },
      ]
    : cart.length > 0
    ? cart
    : [];

  const subtotal = isDirectBuy && directProduct
    ? directProduct.price
    : cartLines.length > 0
    ? cartLines.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    : 0;

  const handleShopifyCheckout = async () => {
    setIsRedirecting(true);
    setError(null);
    try {
      const lines = checkoutItems.map(item => {
        let vId = item.variantId;
        if (!vId) {
          let product = products.find((p) => p.id === item.productId);
          
          // Legacy cart item mapping: If not found by ID, look up by title from legacy local products
          if (!product) {
            const legacyProduct = defaultProducts.find((p) => p.id === item.productId);
            if (legacyProduct) {
              product = products.find(p => p.title.toLowerCase() === legacyProduct.title.toLowerCase());
            }
          }

          if (product) vId = getVariantId(product, item.size, item.color);
        }
        if (!vId) {
          throw new Error("Missing variant ID for item. Please remove and re-add it to your cart.");
        }
        return { merchandiseId: vId, quantity: item.quantity };
      });

      const checkoutUrl = await createShopifyCheckout(lines);
      if (checkoutUrl) window.location.href = checkoutUrl;
      else throw new Error("Failed to generate checkout URL.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during checkout initialization.");
      setIsRedirecting(false);
    }
  };

  if (productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-pureblack/50" />
        <p className="text-pureblack/60 text-sm">Preparing checkout...</p>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-pureblack/5 rounded-full flex items-center justify-center text-pureblack/30">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl text-pureblack/90">Your bag is empty</h2>
          <p className="text-pureblack/50 text-sm">Looks like you haven't added anything to your cart yet.</p>
        </div>
        <a href="/shop" className="w-full bg-pureblack text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest mt-4">
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-10 items-center w-full">
      <div className="text-center space-y-3 w-full">
        <h1 className="font-display text-3xl sm:text-4xl text-pureblack font-normal tracking-tight">Secure Checkout</h1>
        <p className="text-pureblack/50 text-sm max-w-md mx-auto">You will be securely redirected to Shopify to complete your purchase.</p>
      </div>

      <div className="w-full bg-white border border-pureblack/10 rounded-[24px] p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-pureblack/40 mb-2">Order Summary</h2>
          {isDirectBuy ? (
             <div className="flex items-start gap-4">
               <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-[#f5f5f5] rounded-xl overflow-hidden shrink-0 border border-pureblack/5">
                 {directProduct?.images?.[0] && <Image src={directProduct.images[0]} alt={directProduct.title} fill className="object-cover" />}
               </div>
               <div className="flex-1 min-w-0 pt-1">
                 <h3 className="font-bold text-sm sm:text-base text-pureblack truncate">{directProduct?.title}</h3>
                 <p className="text-[11px] sm:text-xs text-pureblack/50 mt-1">{checkoutItems[0].size} / {checkoutItems[0].color}</p>
               </div>
               <div className="text-right pt-1">
                 <p className="font-bold text-sm sm:text-base text-pureblack">{formatINR(directProduct?.price || 0)}</p>
                 <p className="text-[11px] sm:text-xs text-pureblack/40 mt-1">Qty: 1</p>
               </div>
             </div>
          ) : (
            cartLines.map((item, i) => (
              <div key={`${item.product.id}-${i}`} className="flex items-start gap-4">
                <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-[#f5f5f5] rounded-xl overflow-hidden shrink-0 border border-pureblack/5">
                  {item.product.images?.[0] && <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="font-bold text-sm sm:text-base text-pureblack truncate">{item.product.title}</h3>
                  <p className="text-[11px] sm:text-xs text-pureblack/50 mt-1">{item.size} / {item.color}</p>
                </div>
                <div className="text-right pt-1">
                  <p className="font-bold text-sm sm:text-base text-pureblack">{formatINR(item.product.price)}</p>
                  <p className="text-[11px] sm:text-xs text-pureblack/40 mt-1">Qty: {item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="h-px bg-pureblack/10 w-full" />
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm text-pureblack/60"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="flex justify-between text-sm text-pureblack/60"><span>Shipping</span><span>Calculated at next step</span></div>
          <div className="flex justify-between text-base sm:text-lg font-bold text-pureblack mt-2 pt-2 border-t border-pureblack/10">
            <span>Total</span><span>{formatINR(subtotal)}</span>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 text-center">{error}</div>}

        <button
          onClick={handleShopifyCheckout}
          disabled={isRedirecting}
          className="w-full h-14 bg-pureblack text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pureblack/90 transition-colors disabled:opacity-80"
        >
          {isRedirecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</> : <><Lock className="w-4 h-4" /> Proceed to Shopify</>}
        </button>
      </div>

      <div className="flex items-center justify-center gap-8 opacity-40 grayscale">
        <div className="flex items-center gap-2 text-xs font-medium text-pureblack"><Lock className="w-4 h-4" /> SSL Secure</div>
        <div className="flex items-center gap-2 text-xs font-medium text-pureblack">Powered by Shopify</div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] pt-28 pb-20 px-4 sm:px-6 md:px-12 selection:bg-pureblack selection:text-white font-sans">
      <Suspense
        fallback={<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><Loader2 className="w-8 h-8 animate-spin text-pureblack/50" /><p className="text-pureblack/60 text-sm">Loading checkout...</p></div>}
      >
        <CheckoutContent />
      </Suspense>
    </main>
  );
}
