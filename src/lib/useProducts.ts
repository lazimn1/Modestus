"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product, products as defaultProducts } from "@/lib/products";

export function mapDbToProduct(row: any): Product {
  let images = Array.isArray(row.images) ? row.images : (typeof row.images === "string" ? JSON.parse(row.images) : []);
  if (!images || images.length === 0) {
    images = ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80"];
  }

  let colors = Array.isArray(row.colors) ? row.colors : (typeof row.colors === "string" ? JSON.parse(row.colors) : []);
  if (!colors || colors.length === 0) {
    colors = [{ name: "Standard Black", hex: "#0a0a0a" }, { name: "Ivory", hex: "#faf7f2" }];
  }

  let sizes = Array.isArray(row.sizes) ? row.sizes : (typeof row.sizes === "string" ? JSON.parse(row.sizes) : []);
  if (!sizes || sizes.length === 0) {
    sizes = ["XS", "S", "M", "L", "XL"];
  }

  return {
    id: row.id,
    slug: row.slug || `product-${row.id}`,
    title: row.title || "Untitled Creation",
    subtitle: row.subtitle || "Modestus Exclusive",
    price: Number(row.price) || 5000,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    images,
    colors,
    sizes,
    rating: Number(row.rating) || 4.9,
    reviewCount: Number(row.review_count !== undefined ? row.review_count : row.reviewCount) || 0,
    description: row.description || "Crafted from signature luxury fabric, offering an uninterrupted silhouette designed for effortless elegance and movement.",
    fabric: row.fabric || "100% Premium Fabric. Hand wash cold or dry clean recommended.",
    sizeGuide: row.size_guide || row.sizeGuide || "Our garments are tailored for a relaxed, commanding fit. True to size with modest proportions.",
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
