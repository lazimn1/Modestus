"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import { formatINR, products as defaultProducts } from "@/lib/products";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrdersAction } from "@/app/actions/orders";

function formatDate(value: string) {
  const date = new Date(value);
  const dateString = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  
  return `${dateString} at ${timeString}`;
}

function OrderCard({ order }: { order: any }) {
  const items = order.items || [];

  return (
    <article className="bg-[#fcfaf7] border border-[#e7e1d4] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Top Header */}
      <div className="flex flex-col gap-4 pb-6 border-b border-[#e7e1d4]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#78716c]">
              ORDER {order.id}
            </p>
            <p className="text-xs sm:text-base font-bold text-[#2a2621] mt-1">
              {formatDate(order.placed_at)}
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="w-full text-center px-4 py-2.5 md:py-1.5 rounded-full bg-[#e8e2d5] text-[#6b6255] border border-[#dad2c2] text-[11px] md:text-xs font-semibold shadow-sm whitespace-nowrap uppercase tracking-widest">
              {order.status}
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="py-6 flex flex-col gap-6 border-b border-[#e7e1d4]">
        {items.map((item: any, index: number) => {
          // Look up product to get title/image
          const product = defaultProducts.find((p) => p.id === item.productId);
          const title = product?.title || "Unknown Product";
          const imageUrl = product?.images?.[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80";
          const price = product?.price || 0;

          return (
            <div
              key={`${order.id}-${index}`}
              className="flex gap-4 sm:gap-6 items-start"
            >
              <div className="relative w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] rounded-xl overflow-hidden bg-[#e8e2d5] border border-[#dad2c2]/50 shrink-0">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col pt-1">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-base font-bold text-[#2a2621]">
                      {title}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#78716c] mt-1 font-medium">
                      {item.color} / {item.size}
                    </p>
                  </div>
                  <p className="text-xs sm:text-base font-bold text-[#2a2621] shrink-0">
                    {formatINR(price * item.quantity)}
                  </p>
                </div>
                <p className="text-[10px] sm:text-sm text-[#78716c] mt-1 sm:mt-2 font-medium">
                  Qty: {item.quantity}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-6">
        <div className="w-full sm:max-w-sm sm:ml-auto space-y-4 text-xs sm:text-sm text-[#78716c]">
          <div className="flex justify-between items-center text-[#2a2621] font-bold">
            <span className="text-sm md:text-base">Total Paid</span>
            <span className="text-sm md:text-base">{formatINR(order.total)}</span>
          </div>
          {order.payment_method === 'cod' && (
            <p className="text-right text-[10px] sm:text-xs text-[#78716c]">
              To be paid via Cash on Delivery
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function OrdersPage() {
  const { customer, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const successMessage = searchParams.get("success");

  useEffect(() => {
    if (!isAuthLoading && !customer) {
      router.push("/account/login?callbackUrl=/orders");
    }
  }, [customer, isAuthLoading, router]);

  useEffect(() => {
    if (customer) {
      getOrdersAction().then((res) => {
        if (!res.error) setOrders(res.orders);
        setLoadingOrders(false);
      });
    }
  }, [customer]);

  if (isAuthLoading || !customer || loadingOrders) {
    return (
      <main className="min-h-screen bg-[#faf7f2] pt-24 md:pt-36 pb-24 font-sans flex items-center justify-center">
        <p className="text-[#78716c] text-sm uppercase tracking-widest font-bold">Loading Orders...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] pt-24 md:pt-36 pb-24 font-sans">
      <section className="px-4 sm:px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {successMessage && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center text-sm font-bold">
              Your order has been placed successfully!
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12 hidden md:block">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#2a2621] font-normal tracking-tight">
              Your Orders
            </h1>
            <p className="text-xs sm:text-sm text-[#78716c] font-medium mt-3">
              Logged in as {customer.email}
            </p>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl text-[#2a2621] font-normal tracking-tight mb-6">
            Order History ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="min-h-[40vh] flex items-center justify-center text-center bg-[#fcfaf7] border border-[#e7e1d4] rounded-2xl sm:rounded-3xl p-8">
              <div className="max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#e8e2d5] flex items-center justify-center mb-5 border border-[#dad2c2]/50">
                  <Package className="w-7 h-7 text-[#78716c]" />
                </div>
                <h2 className="text-2xl font-serif text-[#2a2621] font-normal">
                  No orders yet
                </h2>
                <p className="text-xs sm:text-sm text-[#78716c] mt-2 font-medium">
                  Completed checkout orders will be saved here for quick review.
                </p>
                <Link
                  href="/shop"
                  className="mt-8 bg-[#2a2621] text-[#faf7f2] text-xs font-bold uppercase tracking-widest rounded-full px-8 py-3.5 inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
