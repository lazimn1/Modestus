"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { products, type Product } from "@/lib/products";
import { createClient } from "@/utils/supabase/client";
import { useOptionalAuth } from "@/context/AuthContext";

export type CartItem = {
  productId: number;
  quantity: number;
  size: string;
  color: string;
  addedAt: string;
};

export type WishlistItem = {
  productId: number;
  addedAt: string;
};

export type ShippingAddress = {
  fullName?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: "online" | "cod";
  status: "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  placedAt: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  shipping_address?: ShippingAddress;
};

export type CartLine = CartItem & {
  product: Product;
};

const CART_KEY = "modestus-cart";
const WISHLIST_KEY = "modestus-wishlist";
const ORDERS_KEY = "modestus-orders";
const CHANGE_EVENT = "modestus-commerce-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function cartKey(item: Pick<CartItem, "productId" | "size" | "color">) {
  return `${item.productId}:${item.size}:${item.color}`;
}

export function getDefaultVariant(product: Product) {
  return {
    size: product.sizes[0] ?? "One Size",
    color: product.colors[0]?.name ?? "Signature",
  };
}

export function getCart(): CartItem[] {
  return readJson<CartItem[]>(CART_KEY, []);
}

export function getWishlist(): WishlistItem[] {
  return readJson<WishlistItem[]>(WISHLIST_KEY, []);
}

export function getOrders(): Order[] {
  return readJson<Order[]>(ORDERS_KEY, []);
}

export function addCartItem(newItem: Omit<CartItem, "addedAt">) {
  const cart = getCart();
  const key = cartKey(newItem);
  const existing = cart.find((item) => cartKey(item) === key);

  const next = existing
    ? cart.map((item) =>
        cartKey(item) === key
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      )
    : [{ ...newItem, addedAt: new Date().toISOString() }, ...cart];

  writeJson(CART_KEY, next);
  return next;
}

export function updateCartItemQuantity(
  target: Pick<CartItem, "productId" | "size" | "color">,
  quantity: number
) {
  const key = cartKey(target);
  const next = getCart()
    .map((item) => (cartKey(item) === key ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeJson(CART_KEY, next);
  return next;
}

export function removeCartItem(target: Pick<CartItem, "productId" | "size" | "color">) {
  const key = cartKey(target);
  const next = getCart().filter((item) => cartKey(item) !== key);

  writeJson(CART_KEY, next);
  return next;
}

export function clearCart() {
  writeJson(CART_KEY, []);
}

export function toggleWishlistItem(productId: number) {
  const wishlist = getWishlist();
  const exists = wishlist.some((item) => item.productId === productId);
  const next = exists
    ? wishlist.filter((item) => item.productId !== productId)
    : [{ productId, addedAt: new Date().toISOString() }, ...wishlist];

  writeJson(WISHLIST_KEY, next);
  return next;
}

export function addWishlistItem(productId: number) {
  const wishlist = getWishlist();

  if (wishlist.some((item) => item.productId === productId)) return wishlist;

  const next = [{ productId, addedAt: new Date().toISOString() }, ...wishlist];
  writeJson(WISHLIST_KEY, next);
  return next;
}

export function removeWishlistItem(productId: number) {
  const next = getWishlist().filter((item) => item.productId !== productId);
  writeJson(WISHLIST_KEY, next);
  return next;
}

export function createOrder(
  items: CartItem[],
  paymentMethod: Order["paymentMethod"],
  shippingData?: ShippingAddress
) {
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 149;
  const order: Order = {
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

export function getCartLines(cart: CartItem[]): CartLine[] {
  return cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is CartLine => Boolean(item));
}

export function useCommerce() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  const auth = useOptionalAuth();
  const user = auth?.user;
  const supabase = createClient();

  const refresh = useCallback(() => {
    setCart(getCart());
    setWishlist(getWishlist());
    setOrders(getOrders());
    setReady(true);
  }, []);

  useEffect(() => {
    const initialSync = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener(CHANGE_EVENT, refresh);

    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (!user?.id) return;

    const syncCloudData = async () => {
      try {
        const syncKey = `modestus_synced_${user.id}`;
        const hasSyncedGuest = typeof window !== "undefined" && window.sessionStorage.getItem(syncKey);

        // 1. Sync wishlist
        const { data: cloudWishlist } = await supabase
          .from("wishlist_items")
          .select("*")
          .eq("user_id", user.id);

        if (!hasSyncedGuest && cloudWishlist) {
          const cloudProductIds = new Set(cloudWishlist.map((i: { product_id: number }) => i.product_id));
          for (const item of getWishlist()) {
            if (!cloudProductIds.has(item.productId)) {
              await supabase.from("wishlist_items").insert({
                user_id: user.id,
                product_id: item.productId,
                created_at: item.addedAt || new Date().toISOString(),
              });
            }
          }
        }

        const { data: updatedWishlist } = await supabase
          .from("wishlist_items")
          .select("*")
          .eq("user_id", user.id);

        if (updatedWishlist) {
          const formatted: WishlistItem[] = updatedWishlist.map((i: { product_id: number; created_at?: string }) => ({
            productId: i.product_id,
            addedAt: i.created_at || new Date().toISOString(),
          }));
          writeJson(WISHLIST_KEY, formatted);
        }

        // 2. Sync cart
        const { data: cloudCart } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id);

        if (!hasSyncedGuest && cloudCart) {
          const cloudKeys = new Set(
            cloudCart.map((i: { product_id: number; size: string; color: string }) => `${i.product_id}:${i.size}:${i.color}`)
          );
          for (const item of getCart()) {
            const key = `${item.productId}:${item.size}:${item.color}`;
            if (!cloudKeys.has(key)) {
              await supabase.from("cart_items").insert({
                user_id: user.id,
                product_id: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                created_at: item.addedAt || new Date().toISOString(),
              });
            }
          }
        }

        const { data: updatedCart } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id);

        if (updatedCart) {
          const formattedCart: CartItem[] = updatedCart.map((i: { product_id: number; quantity: number; size: string; color: string; created_at?: string }) => ({
            productId: i.product_id,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            addedAt: i.created_at || new Date().toISOString(),
          }));
          writeJson(CART_KEY, formattedCart);
        }

        // 3. Sync orders
        const { data: cloudOrders } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("placed_at", { ascending: false });

        if (cloudOrders) {
          const formattedOrders: Order[] = cloudOrders.map((i: { id: string; items: CartItem[]; subtotal: number; shipping: number; total: number; payment_method: Order["paymentMethod"]; status: Order["status"]; placed_at?: string }) => ({
            id: i.id,
            items: i.items,
            subtotal: Number(i.subtotal),
            shipping: Number(i.shipping),
            total: Number(i.total),
            paymentMethod: i.payment_method,
            status: i.status,
            placedAt: i.placed_at || new Date().toISOString(),
          }));

          // Preserve any newly created local orders that haven't synced to Supabase yet
          const localOrders = getOrders();
          const cloudIds = new Set(formattedOrders.map((o) => String(o.id)));
          for (const loc of localOrders) {
            if (!cloudIds.has(String(loc.id))) {
              formattedOrders.push(loc);
            }
          }
          formattedOrders.sort((a, b) => new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime());

          writeJson(ORDERS_KEY, formattedOrders);
        }

        if (typeof window !== "undefined" && !hasSyncedGuest) {
          window.sessionStorage.setItem(syncKey, "true");
        }
      } catch (e) {
        console.error("Cloud sync error:", e);
      }
    };

    syncCloudData();
  }, [user, supabase]);

  const handleAddToCart = useCallback(
    (newItem: Omit<CartItem, "addedAt">) => {
      const next = addCartItem(newItem);
      if (user?.id) {
        const item = next.find((i) => cartKey(i) === cartKey(newItem));
        if (item) {
          supabase.from("cart_items").upsert({
            user_id: user.id,
            product_id: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            created_at: item.addedAt,
          }).then();
        }
      }
      return next;
    },
    [user, supabase]
  );

  const handleUpdateQuantity = useCallback(
    (target: Pick<CartItem, "productId" | "size" | "color">, quantity: number) => {
      const next = updateCartItemQuantity(target, quantity);
      if (user?.id) {
        if (quantity <= 0) {
          supabase
            .from("cart_items")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", target.productId)
            .eq("size", target.size)
            .eq("color", target.color)
            .then();
        } else {
          supabase
            .from("cart_items")
            .update({ quantity })
            .eq("user_id", user.id)
            .eq("product_id", target.productId)
            .eq("size", target.size)
            .eq("color", target.color)
            .then();
        }
      }
      return next;
    },
    [user, supabase]
  );

  const handleRemoveFromCart = useCallback(
    (target: Pick<CartItem, "productId" | "size" | "color">) => {
      const next = removeCartItem(target);
      if (user?.id) {
        supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", target.productId)
          .eq("size", target.size)
          .eq("color", target.color)
          .then();
      }
      return next;
    },
    [user, supabase]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
    if (user?.id) {
      supabase.from("cart_items").delete().eq("user_id", user.id).then();
    }
  }, [user, supabase]);

  const handleToggleWishlist = useCallback(
    (productId: number) => {
      const exists = getWishlist().some((item) => item.productId === productId);
      const next = toggleWishlistItem(productId);
      if (user?.id) {
        if (exists) {
          supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId)
            .then();
        } else {
          supabase.from("wishlist_items").insert({
            user_id: user.id,
            product_id: productId,
            created_at: new Date().toISOString(),
          }).then();
        }
      }
      return next;
    },
    [user, supabase]
  );

  const handleAddToWishlist = useCallback(
    (productId: number) => {
      const exists = getWishlist().some((item) => item.productId === productId);
      const next = addWishlistItem(productId);
      if (user?.id && !exists) {
        supabase.from("wishlist_items").insert({
          user_id: user.id,
          product_id: productId,
          created_at: new Date().toISOString(),
        }).then();
      }
      return next;
    },
    [user, supabase]
  );

  const handleRemoveFromWishlist = useCallback(
    (productId: number) => {
      const next = removeWishlistItem(productId);
      if (user?.id) {
        supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .then();
      }
      return next;
    },
    [user, supabase]
  );

  const handleCreateOrder = useCallback(
    (items: CartItem[], paymentMethod: Order["paymentMethod"], shippingData?: ShippingAddress) => {
      const order = createOrder(items, paymentMethod, shippingData);
      if (user?.id) {
        supabase.from("orders").insert({
          id: order.id,
          user_id: user.id,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          payment_method: order.paymentMethod,
          status: order.status,
          placed_at: order.placedAt,
          customer_name: order.customer_name,
          email: order.email,
          phone: order.phone,
          shipping_address: order.shipping_address,
        }).then();
        supabase.from("cart_items").delete().eq("user_id", user.id).then();
      }
      return order;
    },
    [user, supabase]
  );

  const cartLines = useMemo(() => getCartLines(cart), [cart]);
  const wishlistProducts = useMemo(
    () =>
      wishlist
        .map((item) => products.find((product) => product.id === item.productId))
        .filter((product): product is Product => Boolean(product)),
    [wishlist]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartLines.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  return {
    ready,
    cart,
    cartLines,
    cartCount,
    wishlist,
    wishlistProducts,
    wishlistCount: wishlist.length,
    orders,
    subtotal,
    shipping,
    total,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeFromCart: handleRemoveFromCart,
    clearCart: handleClearCart,
    toggleWishlist: handleToggleWishlist,
    addToWishlist: handleAddToWishlist,
    removeFromWishlist: handleRemoveFromWishlist,
    createOrder: handleCreateOrder,
  };
}
