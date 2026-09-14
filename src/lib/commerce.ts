"use client";

import { useContext, useMemo } from "react";
import { type Product } from "@/lib/products";
import { CommerceContext } from "@/context/CommerceContext";
export type { CartItem, WishlistItem, Order } from "@/context/CommerceContext";
import { useProducts } from "./useProducts";

export type ShippingAddress = {
  fullName?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type CartLine = {
  productId: number;
  variantId?: string;
  quantity: number;
  size: string;
  color: string;
  addedAt: string;
  product: Product;
};

// Local storage logic for cart and wishlist has been removed.
// We only keep orders locally for now until we migrate them to Supabase.
const ORDERS_KEY = "modestus_orders";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error writing to localStorage", err);
  }
}

export function getOrders() {
  return readJson(ORDERS_KEY, []);
}

export function createOrder(
  items: any[],
  paymentMethod: string,
  shippingData?: ShippingAddress
) {
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 149;
  
  const order = {
    id: `MOD-${Date.now().toString().slice(-6)}`,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    paymentMethod,
    status: "Confirmed",
    placedAt: new Date().toISOString(),
    customer_name: shippingData?.fullName || "Guest Customer",
    email: shippingData?.email || "",
    phone: shippingData?.phone || "",
    shipping_address: shippingData || {},
  };

  writeJson(ORDERS_KEY, [order, ...getOrders()]);
  return order;
}

export function getDefaultVariant(product: Product) {
  return {
    size: product.sizes[0] ?? "One Size",
    color: product.colors[0]?.name ?? "Signature",
  };
}

export function getCartLines(cart: any[], productsList: Product[] = []) {
  return cart
    .map((item) => {
      const product = productsList.find((candidate) => candidate.id == item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is any => Boolean(item));
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used within a CommerceProvider");
  }

  const { products: dynamicProducts } = useProducts();

  const cartLines = useMemo(() => getCartLines(context.cart, dynamicProducts), [context.cart, dynamicProducts]);

  const wishlistProducts = useMemo(
    () =>
      context.wishlist
        .map((item) => dynamicProducts.find((product) => product.id == item.productId))
        .filter((product): product is Product => Boolean(product)),
    [context.wishlist, dynamicProducts]
  );

  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartLines.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  return {
    ready: true, // Always true since context handles loading
    cart: context.cart,
    cartLines,
    cartCount,
    wishlist: context.wishlist,
    wishlistProducts,
    wishlistCount: context.wishlistCount,
    orders: context.orders,
    subtotal,
    shipping,
    total,
    addToCart: context.addToCart,
    updateQuantity: context.updateQuantity,
    removeFromCart: context.removeFromCart,
    clearCart: context.clearCart,
    toggleWishlist: context.toggleWishlist,
    addToWishlist: context.toggleWishlist, // Map to toggle
    removeFromWishlist: context.toggleWishlist, // Map to toggle
    createOrder: (items: any, method: string, data: any) => createOrder(items, method, data),
  };
}
