"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { products as staticProducts, type Product } from "@/lib/products";
import { useProducts } from "./useProducts";
import { sendGAEvent } from '@next/third-parties/google';

export type CartItem = {
  productId: number;
  variantId?: string; // Shopify variant GID
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
  shippingData?: ShippingAddress,
  productsList: Product[] = staticProducts
) {
  const subtotal = items.reduce((sum, item) => {
    const product = productsList.find((candidate) => candidate.id === item.productId);
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

export function getCartLines(cart: CartItem[], productsList: Product[] = staticProducts): CartLine[] {
  return cart
    .map((item) => {
      const product = productsList.find((candidate) => candidate.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is CartLine => Boolean(item));
}

export function useCommerce() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const { products: dynamicProducts, loading: productsLoading } = useProducts();

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
    if (ready && !productsLoading) {
      // Clean up invalid items that might be lingering in localStorage
      const validCart = cart.filter(item => dynamicProducts.some(p => p.id === item.productId));
      if (validCart.length !== cart.length) {
        writeJson(CART_KEY, validCart);
      }
      const validWishlist = wishlist.filter(item => dynamicProducts.some(p => p.id === item.productId));
      if (validWishlist.length !== wishlist.length) {
        writeJson(WISHLIST_KEY, validWishlist);
      }
    }
  }, [cart, wishlist, dynamicProducts, ready, productsLoading]);

  const handleAddToCart = useCallback(
    (newItem: Omit<CartItem, "addedAt">) => {
      const product = dynamicProducts.find(p => p.id === newItem.productId);
      if (product) {
        sendGAEvent('event', 'add_to_cart', {
          value: product.price * newItem.quantity,
          currency: 'INR',
          items: [{ item_id: product.id.toString(), item_name: product.title, price: product.price, quantity: newItem.quantity }]
        });
      }
      return addCartItem(newItem);
    },
    [dynamicProducts]
  );

  const handleUpdateQuantity = useCallback(
    (target: Pick<CartItem, "productId" | "size" | "color">, quantity: number) => {
      return updateCartItemQuantity(target, quantity);
    },
    []
  );

  const handleRemoveFromCart = useCallback(
    (target: Pick<CartItem, "productId" | "size" | "color">) => {
      const product = dynamicProducts.find(p => p.id === target.productId);
      if (product) {
        sendGAEvent('event', 'remove_from_cart', {
          currency: 'INR',
          items: [{ item_id: product.id.toString(), item_name: product.title, price: product.price, quantity: 1 }]
        });
      }
      return removeCartItem(target);
    },
    [dynamicProducts]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
  }, []);

  const handleToggleWishlist = useCallback(
    (productId: number) => {
      return toggleWishlistItem(productId);
    },
    []
  );

  const handleAddToWishlist = useCallback(
    (productId: number) => {
      return addWishlistItem(productId);
    },
    []
  );

  const handleRemoveFromWishlist = useCallback(
    (productId: number) => {
      return removeWishlistItem(productId);
    },
    []
  );

  const handleCreateOrder = useCallback(
    (items: CartItem[], paymentMethod: Order["paymentMethod"], shippingData?: ShippingAddress) => {
      const subtotal = items.reduce((sum, item) => {
        const product = dynamicProducts.find((p) => p.id === item.productId);
        return sum + (product?.price ?? 0) * item.quantity;
      }, 0);
      
      sendGAEvent('event', 'begin_checkout', {
        value: subtotal,
        currency: 'INR',
        items: items.map(item => {
          const product = dynamicProducts.find((p) => p.id === item.productId);
          return {
            item_id: item.productId.toString(),
            item_name: product?.title || 'Unknown',
            price: product?.price || 0,
            quantity: item.quantity
          };
        })
      });
      return createOrder(items, paymentMethod, shippingData, dynamicProducts);
    },
    [dynamicProducts]
  );

  const cartLines = useMemo(() => getCartLines(cart, dynamicProducts), [cart, dynamicProducts]);
  const wishlistProducts = useMemo(
    () =>
      wishlist
        .map((item) => dynamicProducts.find((product) => product.id === item.productId))
        .filter((product): product is Product => Boolean(product)),
    [wishlist, dynamicProducts]
  );

  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
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
