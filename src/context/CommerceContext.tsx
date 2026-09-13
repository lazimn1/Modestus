"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { type Product } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";
import { sendGAEvent } from '@next/third-parties/google';
import { syncWishlistAction, toggleWishlistAction } from "@/app/actions/wishlist";
import { updateCartAction, syncCartAction, clearCartAction } from "@/app/actions/cart";
import { useAuth } from "./AuthContext";

export type CartItem = {
  productId: number;
  variantId?: string;
  quantity: number;
  size: string;
  color: string;
  addedAt: string;
};

export type WishlistItem = {
  productId: number;
  addedAt: string;
};

export type Order = {
  id: string;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: string;
  placedAt: string;
  customer_name: string;
  email: string;
  phone: string;
  shipping_address: any;
};

interface CommerceContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: Order[];
  addToCart: (item: Omit<CartItem, "addedAt">) => void;
  updateQuantity: (target: Pick<CartItem, "productId" | "size" | "color">, quantity: number) => void;
  removeFromCart: (target: Pick<CartItem, "productId" | "size" | "color">) => void;
  clearCart: () => void;
  toggleWishlist: (productId: number) => void;
  cartCount: number;
  wishlistCount: number;
}

export const CommerceContext = createContext<CommerceContextType | null>(null);

function cartKey(item: Pick<CartItem, "productId" | "size" | "color">) {
  return `${item.productId}-${item.size}-${item.color}`;
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const pendingWishlistSyncs = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const pendingCartSyncs = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const { customer } = useAuth();
  const { products: dynamicProducts } = useProducts();

  // Load from database on login/mount
  useEffect(() => {
    if (!customer?.id) {
      setCart([]);
      setWishlist([]);
      setOrders([]);
      return;
    }

    // Fetch wishlist
    syncWishlistAction([]).then(res => {
      if (res.success && res.productIds) {
        setWishlist(res.productIds.map((id: number) => ({
          productId: Number(id),
          addedAt: new Date().toISOString()
        })));
      }
    });

    // Fetch cart
    syncCartAction([]).then(res => {
      if (res.success && res.cartItems) {
        setCart(res.cartItems.map((dbItem: any) => ({
          productId: Number(dbItem.product_id),
          quantity: Number(dbItem.quantity),
          size: dbItem.size,
          color: dbItem.color,
          addedAt: dbItem.added_at || new Date().toISOString(),
        })));
      }
    });
  }, [customer?.id]);

  const addToCart = useCallback(
    (newItem: Omit<CartItem, "addedAt">) => {
      if (!customer?.id) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return;
      }
      const product = dynamicProducts.find(p => Number(p.id) === Number(newItem.productId));
      if (product) {
        sendGAEvent('event', 'add_to_cart', {
          value: product.price * newItem.quantity,
          currency: 'INR',
          items: [{ item_id: product.id.toString(), item_name: product.title, price: product.price, quantity: newItem.quantity }]
        });
      }
      
      setCart(prev => {
        const key = cartKey(newItem);
        const existing = prev.find((item) => cartKey(item) === key);
        const next = existing
          ? prev.map((item) => cartKey(item) === key ? { ...item, quantity: item.quantity + newItem.quantity } : item)
          : [{ ...newItem, addedAt: new Date().toISOString() }, ...prev];
        
        // Debounce DB sync
        const syncKey = key;
        if (pendingCartSyncs.current.has(syncKey)) clearTimeout(pendingCartSyncs.current.get(syncKey)!);
        const timeoutId = setTimeout(() => {
          const dbTarget = next.find(i => cartKey(i) === syncKey);
          if (dbTarget) {
            updateCartAction(dbTarget.productId, dbTarget.size, dbTarget.color, dbTarget.quantity);
          } else {
            updateCartAction(newItem.productId, newItem.size, newItem.color, 0);
          }
          pendingCartSyncs.current.delete(syncKey);
        }, 500);
        pendingCartSyncs.current.set(syncKey, timeoutId);
        
        return next;
      });
    },
    [customer?.id, dynamicProducts]
  );

  const updateQuantity = useCallback(
    (target: Pick<CartItem, "productId" | "size" | "color">, quantity: number) => {
      if (!customer?.id) return;
      
      setCart(prev => {
        const key = cartKey(target);
        const next = prev.map((item) => (cartKey(item) === key ? { ...item, quantity } : item)).filter((item) => item.quantity > 0);
        
        const syncKey = key;
        if (pendingCartSyncs.current.has(syncKey)) clearTimeout(pendingCartSyncs.current.get(syncKey)!);
        const timeoutId = setTimeout(() => {
          updateCartAction(target.productId, target.size, target.color, quantity);
          pendingCartSyncs.current.delete(syncKey);
        }, 500);
        pendingCartSyncs.current.set(syncKey, timeoutId);
        
        return next;
      });
    },
    [customer?.id]
  );

  const removeFromCart = useCallback(
    (target: Pick<CartItem, "productId" | "size" | "color">) => {
      if (!customer?.id) return;
      
      const product = dynamicProducts.find(p => Number(p.id) === Number(target.productId));
      if (product) {
        sendGAEvent('event', 'remove_from_cart', {
          value: product.price,
          currency: 'INR',
          items: [{ item_id: product.id.toString(), item_name: product.title, price: product.price, quantity: 1 }]
        });
      }

      setCart(prev => {
        const key = cartKey(target);
        const next = prev.filter((item) => cartKey(item) !== key);
        
        const syncKey = key;
        if (pendingCartSyncs.current.has(syncKey)) clearTimeout(pendingCartSyncs.current.get(syncKey)!);
        const timeoutId = setTimeout(() => {
          updateCartAction(target.productId, target.size, target.color, 0);
          pendingCartSyncs.current.delete(syncKey);
        }, 500);
        pendingCartSyncs.current.set(syncKey, timeoutId);
        
        return next;
      });
    },
    [customer?.id, dynamicProducts]
  );

  const handleClearCart = useCallback(() => {
    setCart([]);
    if (customer?.id) {
      clearCartAction();
    }
  }, [customer?.id]);

  const toggleWishlist = useCallback(
    (productId: number) => {
      if (!customer?.id) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return;
      }
      
      setWishlist(prev => {
        const exists = prev.some((item) => Number(item.productId) === Number(productId));
        const next = exists
          ? prev.filter((item) => Number(item.productId) !== Number(productId))
          : [{ productId: Number(productId), addedAt: new Date().toISOString() }, ...prev];
        
        if (pendingWishlistSyncs.current.has(productId)) clearTimeout(pendingWishlistSyncs.current.get(productId)!);
        const timeoutId = setTimeout(() => {
          const stillExists = next.some((item) => Number(item.productId) === Number(productId));
          toggleWishlistAction(productId, stillExists);
          pendingWishlistSyncs.current.delete(productId);
        }, 500);
        pendingWishlistSyncs.current.set(productId, timeoutId);
        
        return next;
      });
    },
    [customer?.id]
  );

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const wishlistCount = wishlist.length;

  return (
    <CommerceContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart: handleClearCart,
        toggleWishlist,
        cartCount,
        wishlistCount
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}
