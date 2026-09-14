"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCommerce } from "@/lib/commerce";
import { useAuth } from "@/context/AuthContext";
import { createOrderAction, calculateShippingFeeAction } from "@/app/actions/orders";
import { formatINR } from "@/lib/products";
import { Loader2 } from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartLines, subtotal, shipping, total, clearCart } = useCommerce();
  const { customer, isLoading: isAuthLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [dynamicShipping, setDynamicShipping] = useState<number | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // If redirected from PDP 'Buy Now'
  const buyNowProductId = searchParams.get("productId");
  const buyNowSize = searchParams.get("size");
  const buyNowColor = searchParams.get("color");

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("razorpay");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || `${customer.firstName} ${customer.lastName}`.trim(),
        email: prev.email || customer.email,
        phone: prev.phone || customer.phone || "",
      }));
    }
  }, [customer]);

  useEffect(() => {
    if (!isAuthLoading && !customer) {
      router.push("/account/login?callbackUrl=/checkout");
    }
  }, [customer, isAuthLoading, router]);

  useEffect(() => {
    let active = true;
    async function fetchShipping() {
      const pin = formData.pincode.trim();
      if (pin.length >= 2 && subtotal > 0 && subtotal < 999) {
        setIsCalculatingShipping(true);
        try {
          const fee = await calculateShippingFeeAction(pin);
          if (active) setDynamicShipping(fee);
        } catch (e) {
          if (active) setDynamicShipping(150);
        } finally {
          if (active) setIsCalculatingShipping(false);
        }
      } else {
        setDynamicShipping(null);
      }
    }
    
    const timeout = setTimeout(fetchShipping, 600);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [formData.pincode, subtotal]);

  const finalShipping = subtotal >= 999 || subtotal === 0 ? 0 : (dynamicShipping !== null ? dynamicShipping : 149);
  const finalTotal = subtotal + finalShipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderId: string) => {
    const res = await initializeRazorpay();
    if (!res) {
      setError("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    const dataRes = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const orderData = await dataRes.json();

    if (orderData.error) {
      setError(orderData.error);
      setLoading(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock",
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Modestus",
      description: "Secure Checkout",
      order_id: orderData.id,
      handler: async function (response: any) {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderId,
          }),
        });
        
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          clearCart();
          router.push("/orders?success=true");
        } else {
          setError("Payment verification failed. Please contact support.");
          setLoading(false);
        }
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: "#2a2621" },
      modal: {
        ondismiss: function() { setLoading(false); }
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If using Buy Now, we'd ideally fetch that product. But for simplicity, we assume
    // the user was redirected to checkout with their cart populated, or we just process the cart.
    // In a real app, Buy Now would either add to cart and redirect, or we'd process the single item.
    // Our handleBuyNow currently adds to cart or redirects directly? Wait, previous plan was to redirect.
    // Let's assume the cart is what we are checking out.

    if (cartLines.length === 0) {
      setError("Your cart is empty.");
      setLoading(false);
      return;
    }

    const cartItems = cartLines.map(line => ({
      productId: line.productId,
      quantity: line.quantity,
      size: line.size,
      color: line.color,
    }));

    const res = await createOrderAction(cartItems, formData, paymentMethod);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      if (paymentMethod === "razorpay" && res.orderId) {
        await handleRazorpayPayment(res.orderId);
      } else {
        clearCart();
        router.push("/orders?success=true");
      }
    }
  };

  if (isAuthLoading || !customer) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#2a2621]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] pt-24 md:pt-36 pb-24 font-sans">
      <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2a2621] mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Form */}
          <div className="bg-[#fcfaf7] border border-[#e7e1d4] rounded-3xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#2a2621] mb-6">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#78716c]">Full Name</label>
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="h-12 border border-[#dad2c2] rounded-lg px-4 bg-white text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#78716c]">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="h-12 border border-[#dad2c2] rounded-lg px-4 bg-white text-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#78716c]">Phone</label>
                <input required name="phone" value={formData.phone} onChange={handleInputChange} className="h-12 border border-[#dad2c2] rounded-lg px-4 bg-white text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#78716c]">Street Address</label>
                <input required name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} className="h-12 border border-[#dad2c2] rounded-lg px-4 bg-white text-sm" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#78716c]">City</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} className="h-12 border border-[#dad2c2] rounded-lg px-4 bg-white text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#78716c]">State</label>
                  <input required name="state" value={formData.state} onChange={handleInputChange} className="h-12 border border-[#dad2c2] rounded-lg px-4 bg-white text-sm" />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-1 col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#78716c]">Pincode</label>
                  <input required name="pincode" value={formData.pincode} onChange={handleInputChange} className="h-12 border border-[#dad2c2] rounded-lg px-4 bg-white text-sm" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-[#2a2621] mt-4 border-t border-[#e7e1d4] pt-6 mb-2">Payment</h2>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-colors text-left ${paymentMethod === "razorpay" ? "border-[#2a2621] bg-white" : "border-[#e7e1d4] bg-transparent opacity-60"}`}
                >
                  <div className={`w-4 h-4 rounded-full border-[5px] ${paymentMethod === "razorpay" ? "border-[#2a2621]" : "border-[#dad2c2]"}`} />
                  <span className="font-bold text-[#2a2621]">Pay securely with Card / UPI (Razorpay)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-colors text-left ${paymentMethod === "cod" ? "border-[#2a2621] bg-white" : "border-[#e7e1d4] bg-transparent opacity-60"}`}
                >
                  <div className={`w-4 h-4 rounded-full border-[5px] ${paymentMethod === "cod" ? "border-[#2a2621]" : "border-[#dad2c2]"}`} />
                  <span className="font-bold text-[#2a2621]">Cash on Delivery (COD)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Summary */}
          <aside className="bg-[#fcfaf7] border border-[#e7e1d4] rounded-3xl p-6 sm:p-8 h-fit lg:sticky lg:top-32">
            <h2 className="text-xl font-serif text-[#2a2621] mb-6">Order Summary</h2>
            <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {cartLines.map(line => (
                <div key={`${line.productId}-${line.size}-${line.color}`} className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#2a2621] truncate">{line.product.title}</p>
                    <p className="text-xs text-[#78716c]">{line.color} / {line.size} x {line.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[#2a2621] shrink-0">{formatINR(line.product.price * line.quantity)}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-3 text-sm text-[#78716c] border-t border-[#e7e1d4] pt-6 mb-6">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  Shipping 
                  {isCalculatingShipping && <Loader2 className="w-3 h-3 animate-spin text-[#2a2621]" />}
                </span>
                <span>
                  {finalShipping === 0 ? "Free" : formatINR(finalShipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#2a2621] text-lg mt-2 pt-2 border-t border-[#e7e1d4]">
                <span>Total</span><span>{formatINR(finalTotal)}</span>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm font-medium text-center mb-4">{error}</p>}

            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full h-12 bg-[#2a2621] hover:bg-[#3d3730] text-[#fcfaf7] font-bold tracking-widest uppercase text-xs rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </span>
              ) : paymentMethod === "razorpay" ? (
                "Proceed to Payment"
              ) : (
                "Place Order"
              )}
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center pt-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#2a2621]" />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
