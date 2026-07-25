"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product, products as defaultProducts } from "@/lib/products";

export function mapDbToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug || "",
    title: row.title || "",
    subtitle: row.subtitle || "",
    price: Number(row.price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    images: Array.isArray(row.images) ? row.images : (typeof row.images === "string" ? JSON.parse(row.images) : []),
    colors: Array.isArray(row.colors) ? row.colors : (typeof row.colors === "string" ? JSON.parse(row.colors) : []),
    sizes: Array.isArray(row.sizes) ? row.sizes : (typeof row.sizes === "string" ? JSON.parse(row.sizes) : ["XS", "S", "M", "L", "XL"]),
    rating: Number(row.rating) || 4.9,
    reviewCount: Number(row.review_count !== undefined ? row.review_count : row.reviewCount) || 0,
    description: row.description || "",
    fabric: row.fabric || "",
    sizeGuide: row.size_guide || row.sizeGuide || "",
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
    badge: row.badge || undefined,
    aspectClass: row.aspect_class || row.aspectClass || "aspect-[3/4]",
  };
}

export function mapProductToDb(p: Partial<Product>): any {
  const db: any = {};
  if (p.slug !== undefined) db.slug = p.slug;
  if (p.title !== undefined) db.title = p.title;
  if (p.subtitle !== undefined) db.subtitle = p.subtitle;
  if (p.price !== undefined) db.price = p.price;
  if (p.originalPrice !== undefined) db.original_price = p.originalPrice || null;
  if (p.images !== undefined) db.images = p.images;
  if (p.colors !== undefined) db.colors = p.colors;
  if (p.sizes !== undefined) db.sizes = p.sizes;
  if (p.rating !== undefined) db.rating = String(p.rating);
  if (p.reviewCount !== undefined) db.review_count = p.reviewCount;
  if (p.description !== undefined) db.description = p.description;
  if (p.fabric !== undefined) db.fabric = p.fabric;
  if (p.sizeGuide !== undefined) db.size_guide = p.sizeGuide;
  if (p.badge !== undefined) db.badge = p.badge || null;
  if (p.aspectClass !== undefined) db.aspect_class = p.aspectClass;
  return db;
}

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
