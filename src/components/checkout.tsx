"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Image from "next/image";
import { products, formatINR } from "@/lib/products";
import { useSearchParams } from "next/navigation";

type ShippingData = {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("productId");
  const productId = productIdParam ? parseInt(productIdParam) : 1;
  const product = products.find((p) => p.id === productId) || products[0];

  const { register } = useForm<ShippingData>({ mode: "onChange" });
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  const inputClass =
    "w-full bg-transparent border border-pureblack/10 focus:border-pureblack/30 rounded-[14px] px-5 py-3.5 text-sm outline-none transition-colors duration-300 placeholder:text-pureblack/40 text-pureblack";

  const subtotal = product.price;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      {/* Left Column - Checkout Form */}
      <div className="w-full lg:col-span-7 flex flex-col gap-10">
        {/* Delivery Details Section */}
        <section>
          <h2 className="font-display text-2xl text-pureblack/80 mb-5 font-normal tracking-wide">
            Delivery Details
          </h2>
          <form className="flex flex-col gap-4">
            <div>
              <input
                {...register("fullName")}
                placeholder="Full name *"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                {...register("email")}
                placeholder="Email *"
                className={inputClass}
              />
              <input
                {...register("phone")}
                placeholder="Phone *"
                className={inputClass}
              />
            </div>

            <div>
              <textarea
                {...register("streetAddress")}
                placeholder="Street address *"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                {...register("city")}
                placeholder="City *"
                className={inputClass}
              />
              <input
                {...register("state")}
                placeholder="State *"
                className={inputClass}
              />
              <input
                {...register("pincode")}
                placeholder="PIN code *"
                className={inputClass}
              />
            </div>
          </form>
        </section>

        {/* Payment Method Section */}
        <section>
          <h2 className="font-display text-2xl text-pureblack/80 mb-5 font-normal tracking-wide">
            Payment Method
          </h2>
          <div className="flex flex-col gap-4">
            <label
              className={`flex items-start gap-4 p-5 rounded-[14px] border cursor-pointer transition-colors duration-300 ${
                paymentMethod === "online"
                  ? "border-pureblack bg-pureblack/5"
                  : "border-pureblack/10 bg-transparent hover:border-pureblack/20"
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="hidden"
                />
                <div
                  className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
                    paymentMethod === "online"
                      ? "border-pureblack"
                      : "border-pureblack/30"
                  }`}
                >
                  {paymentMethod === "online" && (
                    <div className="w-[8px] h-[8px] rounded-full bg-pureblack" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-pureblack leading-tight">
                  Pay Online
                </span>
                <span className="text-[11px] text-pureblack/50 mt-1">
                  UPI, cards, netbanking & wallets
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-4 p-5 rounded-[14px] border cursor-pointer transition-colors duration-300 ${
                paymentMethod === "cod"
                  ? "border-pureblack bg-pureblack/5"
                  : "border-pureblack/10 bg-transparent hover:border-pureblack/20"
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="hidden"
                />
                <div
                  className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
                    paymentMethod === "cod"
                      ? "border-pureblack"
                      : "border-pureblack/30"
                  }`}
                >
                  {paymentMethod === "cod" && (
                    <div className="w-[8px] h-[8px] rounded-full bg-pureblack" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-pureblack leading-tight">
                  Cash on Delivery
                </span>
                <span className="text-[11px] text-pureblack/50 mt-1">
                  Pay when your order arrives
                </span>
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* Right Column - Order Summary */}
      <div className="w-full lg:col-span-5 relative">
        <div className="sticky top-28 border border-pureblack/10 rounded-2xl bg-transparent p-6 md:p-8 flex flex-col gap-6">
          <h2 className="font-display text-xl text-pureblack">Order Summary</h2>

          {/* Cart Items */}
          <div className="flex flex-col gap-5 mt-2">
            <div key={product.id} className="flex gap-4 items-start">
              <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg bg-pureblack/5">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col flex-1 py-0.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-pureblack leading-tight pr-4">
                    {product.title}
                  </h4>
                  <span className="text-sm font-semibold text-pureblack shrink-0">
                    {formatINR(product.price)}
                  </span>
                </div>
                <p className="text-xs text-pureblack/50 mt-1">
                  Size One Size · Qty 1
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-pureblack/10 my-1" />

          {/* Totals */}
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between items-center text-pureblack/60">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-pureblack/60">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-pureblack">Total</span>
              <span className="text-lg font-bold text-pureblack">
                {formatINR(total)}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-pureblack text-purewhite text-sm font-semibold py-4 mt-2 rounded-full transition-colors duration-300 hover:bg-pureblack/80"
          >
            {paymentMethod === "online" ? "Pay Now" : "Place Order"}
          </motion.button>

          <p className="text-[10px] text-pureblack/50 text-center -mt-2">
            Secure checkout · Easy returns within 7 days
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-purewhite pt-28 pb-20 font-sans">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <Suspense fallback={<div className="min-h-screen" />}>
          <CheckoutContent />
        </Suspense>
      </div>
    </main>
  );
}
