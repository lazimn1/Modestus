"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { type Product } from "@/lib/products";
import { useProducts } from "./useProducts";
import { sendGAEvent } from '@next/third-parties/google';
import { syncWishlistAction, toggleWishlistAction } from "@/app/actions/wishlist";
import { updateCartAction, syncCartAction, clearCartAction } from "@/app/actions/cart";
import { type CartSyncItem } from "@/app/actions/cart";
import { useAuth } from "@/context/AuthContext";

export type CartItem = {
  productId: number;
  variantId?: string; // Reserved for future payment gateway variant ID
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

export function clearCommerceState() {
  writeJson(CART_KEY, []);
  writeJson(WISHLIST_KEY, []);
  writeJson(ORDERS_KEY, []);
}

export function toggleWishlistItem(productId: number) {
  const wishlist = getWishlist();
  const exists = wishlist.some((item) => Number(item.productId) === Number(productId));
  const next = exists
    ? wishlist.filter((item) => Number(item.productId) !== Number(productId))
    : [{ productId: Number(productId), addedAt: new Date().toISOString() }, ...wishlist];

  writeJson(WISHLIST_KEY, next);
  return next;
}

export function addWishlistItem(productId: number) {
  const wishlist = getWishlist();

  if (wishlist.some((item) => Number(item.productId) === Number(productId))) return wishlist;

  const next = [{ productId: Number(productId), addedAt: new Date().toISOString() }, ...wishlist];
  writeJson(WISHLIST_KEY, next);
  return next;
}

export function removeWishlistItem(productId: number) {
  const next = getWishlist().filter((item) => Number(item.productId) !== Number(productId));
  writeJson(WISHLIST_KEY, next);
  return next;
}

export function createOrder(
  items: CartItem[],
  paymentMethod: Order["paymentMethod"],
  shippingData?: ShippingAddress,
  productsList: Product[] = []
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

export function getCartLines(cart: CartItem[], productsList: Product[] = []): CartLine[] {
  return cart
    .map((item) => {
      const product = productsList.find((candidate) => candidate.id == item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is CartLine => Boolean(item));
}

let globalSyncComplete = false;
let globalCartSyncComplete = false;
const pendingWishlistSyncs = new Map<number, ReturnType<typeof setTimeout>>();
const pendingCartSyncs = new Map<string, ReturnType<typeof setTimeout>>();

export function useCommerce() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const { products: dynamicProducts, loading: productsLoading } = useProducts();
  const { customer } = useAuth();

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

    // Clean up logic removed to prevent deleting valid items not currently in paginated dynamicProducts

  // Sync with Supabase on mount / login
  useEffect(() => {
    if (customer?.id && ready && !productsLoading && !globalSyncComplete) {
      globalSyncComplete = true;
      const localProductIds = wishlist.map((item) => Number(item.productId));
      syncWishlistAction(localProductIds).then((res) => {
        if (res.success && res.productIds) {
          const syncedWishlist = res.productIds.map((id: number) => ({
            productId: Number(id),
            addedAt: new Date().toISOString(),
          }));
          // Only update if different to avoid infinite loops
          if (
            syncedWishlist.length !== wishlist.length ||
            !syncedWishlist.every((s: WishlistItem) =>
              wishlist.some((w) => Number(w.productId) === Number(s.productId))
            )
          ) {
            writeJson(WISHLIST_KEY, syncedWishlist);
          }
        }
      });
    }

    if (customer?.id && ready && !productsLoading && !globalCartSyncComplete) {
      globalCartSyncComplete = true;
      const localCartItems: CartSyncItem[] = cart.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));
      syncCartAction(localCartItems).then((res) => {
        if (res.success && res.cartItems) {
          // Map backend format to frontend CartItem format
          const syncedCart: CartItem[] = res.cartItems.map((dbItem: any) => ({
            productId: dbItem.product_id,
            quantity: dbItem.quantity,
            size: dbItem.size,
            color: dbItem.color,
            addedAt: dbItem.added_at || new Date().toISOString(),
          }));

          // Only update if lengths differ or items differ
          // Just unconditionally update local storage to trust DB as source of truth for cart
          writeJson(CART_KEY, syncedCart);
        }
      });
    }
  }, [customer?.id, ready, productsLoading, wishlist, cart]); // run when ready, but use global variable to prevent multiple runs

  const handleAddToCart = useCallback(
    (newItem: Omit<CartItem, "addedAt">) => {
      if (!customer?.id) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return getCart();
      }
      const product = dynamicProducts.find(p => Number(p.id) === Number(newItem.productId));
      if (product) {
        sendGAEvent('event', 'add_to_cart', {
          value: product.price * newItem.quantity,
          currency: 'INR',
          items: [{ item_id: product.id.toString(), item_name: product.title, price: product.price, quantity: newItem.quantity }]
        });
      }
      
      const nextCart = addCartItem(newItem);
      
      if (customer?.id) {
        const syncKey = `${newItem.productId}-${newItem.size}-${newItem.color}`;
        if (pendingCartSyncs.has(syncKey)) {
          clearTimeout(pendingCartSyncs.get(syncKey));
        }
        
        const timeoutId = setTimeout(() => {
          const latestCart = getCart();
          const dbTarget = latestCart.find(i => 
            Number(i.productId) === Number(newItem.productId) && 
            i.size === newItem.size && 
            i.color === newItem.color
          );
          
          if (dbTarget) {
            updateCartAction(dbTarget.productId, dbTarget.size, dbTarget.color, dbTarget.quantity);
          } else {
            // It got added and removed so fast it's no longer in cart
            updateCartAction(newItem.productId, newItem.size, newItem.color, 0);
          }
          pendingCartSyncs.delete(syncKey);
        }, 500);
        pendingCartSyncs.set(syncKey, timeoutId);
      }
      
      return nextCart;
    },
    [dynamicProducts, customer?.id]
  );

  const handleUpdateQuantity = useCallback(
    (target: Pick<CartItem, "productId" | "size" | "color">, quantity: number) => {
      const nextCart = updateCartItemQuantity(target, quantity);
      
      if (customer?.id) {
        const syncKey = `${target.productId}-${target.size}-${target.color}`;
        if (pendingCartSyncs.has(syncKey)) {
          clearTimeout(pendingCartSyncs.get(syncKey));
        }
        
        const timeoutId = setTimeout(() => {
          updateCartAction(target.productId, target.size, target.color, quantity);
          pendingCartSyncs.delete(syncKey);
        }, 500);
        pendingCartSyncs.set(syncKey, timeoutId);
      }
      
      return nextCart;
    },
    [customer?.id]
  );

  const handleRemoveFromCart = useCallback(
    (target: Pick<CartItem, "productId" | "size" | "color">) => {
      const product = dynamicProducts.find(p => Number(p.id) === Number(target.productId));
      if (product) {
        sendGAEvent('event', 'remove_from_cart', {
          value: product.price,
          currency: 'INR',
          items: [{ item_id: product.id.toString(), item_name: product.title, price: product.price, quantity: 1 }]
        });
      }
      const nextCart = removeCartItem(target);
      
      if (customer?.id) {
        const syncKey = `${target.productId}-${target.size}-${target.color}`;
        if (pendingCartSyncs.has(syncKey)) {
          clearTimeout(pendingCartSyncs.get(syncKey));
        }
        
        const timeoutId = setTimeout(() => {
          updateCartAction(target.productId, target.size, target.color, 0); // 0 deletes it
          pendingCartSyncs.delete(syncKey);
        }, 500);
        pendingCartSyncs.set(syncKey, timeoutId);
      }
      
      return nextCart;
    },
    [dynamicProducts, customer?.id]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
    if (customer?.id) {
      clearCartAction();
    }
  }, [customer?.id]);

  const handleToggleWishlist = useCallback(
    (productId: number) => {
      if (!customer?.id) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return getWishlist();
      }
      const currentWishlist = getWishlist();
      const isAdding = !currentWishlist.some(item => Number(item.productId) === Number(productId));
      const next = toggleWishlistItem(productId);
      
      if (customer?.id) {
        if (pendingWishlistSyncs.has(productId)) {
          clearTimeout(pendingWishlistSyncs.get(productId));
        }
        const timeoutId = setTimeout(() => {
          const latestWishlist = getWishlist();
          const stillExists = latestWishlist.some(item => Number(item.productId) === Number(productId));
          toggleWishlistAction(productId, stillExists);
          pendingWishlistSyncs.delete(productId);
        }, 500);
        pendingWishlistSyncs.set(productId, timeoutId);
      }
      return next;
    },
    [customer?.id]
  );

  const handleAddToWishlist = useCallback(
    (productId: number) => {
      if (!customer?.id) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return getWishlist();
      }
      const currentWishlist = getWishlist();
      const exists = currentWishlist.some(item => Number(item.productId) === Number(productId));
      const next = addWishlistItem(productId);
      
      if (!exists && customer?.id) {
        if (pendingWishlistSyncs.has(productId)) {
          clearTimeout(pendingWishlistSyncs.get(productId));
        }
        const timeoutId = setTimeout(() => {
          const latestWishlist = getWishlist();
          const stillExists = latestWishlist.some(item => Number(item.productId) === Number(productId));
          if (stillExists) toggleWishlistAction(productId, true);
          pendingWishlistSyncs.delete(productId);
        }, 500);
        pendingWishlistSyncs.set(productId, timeoutId);
      }
      return next;
    },
    [customer?.id]
  );

  const handleRemoveFromWishlist = useCallback(
    (productId: number) => {
      const currentWishlist = getWishlist();
      const exists = currentWishlist.some(item => Number(item.productId) === Number(productId));
      const next = removeWishlistItem(productId);
      
      if (exists && customer?.id) {
        if (pendingWishlistSyncs.has(productId)) {
          clearTimeout(pendingWishlistSyncs.get(productId));
        }
        const timeoutId = setTimeout(() => {
          const latestWishlist = getWishlist();
          const stillExists = latestWishlist.some(item => Number(item.productId) === Number(productId));
          if (!stillExists) toggleWishlistAction(productId, false);
          pendingWishlistSyncs.delete(productId);
        }, 500);
        pendingWishlistSyncs.set(productId, timeoutId);
      }
      return next;
    },
    [customer?.id]
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
        .map((item) => dynamicProducts.find((product) => product.id == item.productId))
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
    wishlistCount: wishlistProducts.length,
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
