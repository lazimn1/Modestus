"use client";

import { useState, useEffect, useCallback } from "react";
import { Product, mapSupabaseToProduct } from "@/lib/products";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("products")
        .select("*, reviews(*)")
        .order("id", { ascending: true });

      if (!error && data) {
        setProducts(data.map(mapSupabaseToProduct));
      } else if (error) {
        console.error("Failed to fetch products from Supabase:", error);
      }
    } catch (e) {
      console.error("Failed to fetch products from Supabase:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}

// Helper to find the variant ID — returns undefined until a real payment gateway
// is integrated. The variantId field on cart items will be undefined for now.
export function getVariantId(
  product: Product,
  _size: string,
  _color: string
): string | undefined {
  return undefined;
}
