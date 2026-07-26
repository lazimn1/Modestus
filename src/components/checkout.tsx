"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Image from "next/image";
import { products, formatINR } from "@/lib/products";
import { useSearchParams, useRouter } from "next/navigation";
import { useCommerce, type ShippingAddress, type CartItem } from "@/lib/commerce";

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
  const router = useRouter();
  const { cart, cartLines, handleCreateOrder, clearCart } = useCommerce();

  // If a specific productId is passed in URL, checkout only that item; otherwise checkout the active cart bag
  const isDirectBuy = Boolean(productIdParam);
  const directProduct = products.find((p) => p.id === Number(productIdParam)) || products[0];

  const checkoutItems: CartItem[] = isDirectBuy
    ? [
        {
          productId: directProduct.id,
          quantity: 1,
          size: "One Size",
          color: "Signature",
          addedAt: new Date().toISOString(),
        },
      ]
    : cart.length > 0
    ? cart
    : [
        {
          productId: directProduct.id,
          quantity: 1,
          size: "One Size",
          color: "Signature",
          addedAt: new Date().toISOString(),
        },
      ];

  const subtotal = isDirectBuy
    ? directProduct.price
    : cartLines.length > 0
    ? cartLines.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    : directProduct.price;

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingData>({ mode: "onChange" });

  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass = (hasError?: boolean) =>
    `w-full bg-transparent border ${
      hasError ? "border-red-500 focus:border-red-600" : "border-pureblack/10 focus:border-pureblack/30"
    } rounded-[14px] px-5 py-3.5 text-sm outline-none transition-colors duration-300 placeholder:text-pureblack/40 text-pureblack`;

  const onSubmit = (data: ShippingData) => {
    setIsSubmitting(true);
    const shippingDetails: ShippingAddress = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
    };

    // Create order with full customer contact & shipping details attached
    const order = handleCreateOrder(checkoutItems, paymentMethod, shippingDetails);

    if (!isDirectBuy) {
      clearCart();
    }

    router.push(`/orders?order=${order.id}`);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      {/* Left Column - Checkout Form */}
      <div className="w-full lg:col-span-7 flex flex-col gap-10">
        {/* Delivery Details Section */}
        <section>
          <h2 className="font-display text-2xl text-pureblack/80 mb-5 font-normal tracking-wide">
            Delivery Details
          </h2>
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <input
                {...register("fullName", { required: "Full name is required" })}
                placeholder="Full name *"
                className={inputClass(Boolean(errors.fullName))}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1 pl-1">{errors.fullName.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="Email *"
                  className={inputClass(Boolean(errors.email))}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email.message}</p>}
              </div>
              <div>
                <input
                  {...register("phone", { required: "Phone number is required" })}
                  placeholder="Phone *"
                  className={inputClass(Boolean(errors.phone))}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 pl-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <textarea
                {...register("streetAddress", { required: "Street address is required" })}
                placeholder="Street address *"
                rows={3}
                className={`${inputClass(Boolean(errors.streetAddress))} resize-none`}
              />
              {errors.streetAddress && (
                <p className="text-red-500 text-xs mt-1 pl-1">{errors.streetAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  {...register("city", { required: "City is required" })}
                  placeholder="City *"
                  className={inputClass(Boolean(errors.city))}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1 pl-1">{errors.city.message}</p>}
              </div>
              <div>
                <input
                  {...register("state", { required: "State is required" })}
                  placeholder="State *"
                  className={inputClass(Boolean(errors.state))}
                />
                {errors.state && <p className="text-red-500 text-xs mt-1 pl-1">{errors.state.message}</p>}
              </div>
              <div>
                <input
                  {...register("pincode", { required: "PIN code is required" })}
                  placeholder="PIN code *"
                  className={inputClass(Boolean(errors.pincode))}
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1 pl-1">{errors.pincode.message}</p>}
              </div>
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
                    paymentMethod === "online" ? "border-pureblack" : "border-pureblack/30"
                  }`}
                >
                  {paymentMethod === "online" && (
                    <div className="w-[8px] h-[8px] rounded-full bg-pureblack" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-pureblack leading-tight">Pay Online</span>
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
                    paymentMethod === "cod" ? "border-pureblack" : "border-pureblack/30"
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

          {/* Cart Items Summary */}
          <div className="flex flex-col gap-5 mt-2 max-h-[320px] overflow-y-auto pr-1">
            {isDirectBuy ? (
              <div key={directProduct.id} className="flex gap-4 items-start">
                <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg bg-pureblack/5">
                  <Image
                    src={directProduct.images[0]}
                    alt={directProduct.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1 py-0.5">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-pureblack leading-tight pr-4">
                      {directProduct.title}
                    </h4>
                    <span className="text-sm font-semibold text-pureblack shrink-0">
                      {formatINR(directProduct.price)}
                    </span>
                  </div>
                  <p className="text-xs text-pureblack/50 mt-1">Size One Size · Qty 1</p>
                </div>
              </div>
            ) : cartLines.length > 0 ? (
              cartLines.map((line) => (
                <div key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-4 items-start">
                  <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg bg-pureblack/5">
                    <Image
                      src={line.product.images[0]}
                      alt={line.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 py-0.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-pureblack leading-tight pr-4">
                        {line.product.title}
                      </h4>
                      <span className="text-sm font-semibold text-pureblack shrink-0">
                        {formatINR(line.product.price * line.quantity)}
                      </span>
                    </div>
                    <p className="text-xs text-pureblack/50 mt-1">
                      Size {line.size} · Color {line.color} · Qty {line.quantity}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div key={directProduct.id} className="flex gap-4 items-start">
                <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg bg-pureblack/5">
                  <Image
                    src={directProduct.images[0]}
                    alt={directProduct.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1 py-0.5">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-pureblack leading-tight pr-4">
                      {directProduct.title}
                    </h4>
                    <span className="text-sm font-semibold text-pureblack shrink-0">
                      {formatINR(directProduct.price)}
                    </span>
                  </div>
                  <p className="text-xs text-pureblack/50 mt-1">Size One Size · Qty 1</p>
                </div>
              </div>
            )}
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
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-pureblack">Total</span>
              <span className="text-lg font-bold text-pureblack">{formatINR(total)}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full bg-pureblack text-purewhite text-sm font-semibold py-4 mt-2 rounded-full transition-colors duration-300 hover:bg-pureblack/80 disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : paymentMethod === "online"
              ? "Pay Now"
              : "Place Order"}
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
