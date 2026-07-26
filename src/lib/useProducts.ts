"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product, products as defaultProducts, mapDbToProduct, mapProductToDb } from "@/lib/products";

export { mapDbToProduct, mapProductToDb };

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });
      if (data && data.length > 0) {
        setProducts(data.map(mapDbToProduct));
      }
    } catch (e) {
      console.error("Failed to fetch products from Supabase:", e);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}
