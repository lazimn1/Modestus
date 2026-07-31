"use client";

import { useState, useEffect, useCallback } from "react";
// ── SUPABASE DISCONNECTED ── (kept for easy restoration)
// import { createClient } from "@/utils/supabase/client";
import { getProducts } from "@/lib/shopify/queries";
import { Product, products as defaultProducts, mapDbToProduct, mapProductToDb } from "@/lib/products";

export { mapDbToProduct, mapProductToDb };

// Helper: map a raw Shopify product node to the local Product shape
function mapShopifyToProduct(node: any): Product {
  const price = parseFloat(node.priceRange?.maxVariantPrice?.amount ?? "0");
  const imageUrl = node.images?.edges?.[0]?.node?.url ?? "";
  return {
    id: 0,
    title: node.title ?? "",
    subtitle: node.description?.split(".")[0] ?? "",
    description: node.description ?? "",
    price,
    slug: node.handle ?? "",
    fabric: "",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Default", hex: "#000000" }],
    images: imageUrl ? [imageUrl] : [],
    badge: undefined,
    rating: 0,
    reviewCount: 0,
    sizeGuide: "",
    reviews: [],
    aspectClass: "",
    originalPrice: undefined,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState<boolean>(true);

  // ── SUPABASE DISCONNECTED ── (kept for easy restoration)
  // const supabase = createClient();
  // const fetchProducts = useCallback(async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("products")
  //       .select("*")
  //       .order("id", { ascending: true });
  //     if (data && data.length > 0) {
  //       setProducts(data.map(mapDbToProduct));
  //     }
  //   } catch (e) {
  //     console.error("Failed to fetch products from Supabase:", e);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [supabase]);

  // ── SHOPIFY STOREFRONT API ──
  const fetchProducts = useCallback(async () => {
    try {
      const nodes = await getProducts();
      if (nodes && nodes.length > 0) {
        setProducts(nodes.map(mapShopifyToProduct));
      }
    } catch (e) {
      console.error("Failed to fetch products from Shopify:", e);
      // Falls back to static default products already set in state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}
