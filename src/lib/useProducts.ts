"use client";

import { useState, useEffect, useCallback } from "react";
import { Product, products as defaultProducts } from "@/lib/products";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Map a Supabase products row to the local Product shape
export function mapSupabaseToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    images: row.images ?? [],
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    badge: row.badge ?? undefined,
    description: row.description ?? "",
    fabric: row.fabric ?? "",
    sizeGuide: row.size_guide ?? "",
    rating: parseFloat(row.rating ?? "0"),
    reviewCount: row.review_count ?? 0,
    aspectClass: row.aspect_class ?? "",
    reviews: (row.reviews ?? []).map((r: any) => ({
      id: r.id,
      author: r.author,
      location: r.location,
      rating: r.rating,
      date: r.date,
      text: r.text,
      initials: r.initials,
      avatarColor: r.avatar_color,
    })),
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("products")
        .select("*, reviews(*)")
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        setProducts(data.map(mapSupabaseToProduct));
      }
      // Falls back to static defaultProducts already set in state if error/empty
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
