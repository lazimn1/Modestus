"use client";

import { useState, useEffect, useCallback } from "react";
import { getProducts } from "@/lib/shopify/queries";
import { Product, products as defaultProducts } from "@/lib/products";

// Simple string hash for fallback numeric IDs
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

// Helper: map a raw Shopify product node to the local Product shape
export function mapShopifyToProduct(node: any): Product {
  const price = parseFloat(node.priceRange?.maxVariantPrice?.amount ?? "0");
  const images = node.images?.edges?.map((edge: any) => edge.node.url) || [];
  
  // Extract variants
  const shopifyVariants = node.variants?.edges?.map((edge: any) => edge.node) || [];
  
  // Extract unique sizes and colors from Shopify variant options
  const extractedSizes = new Set<string>();
  const extractedColors = new Map<string, string>(); // name -> hex

  shopifyVariants.forEach((variant: any) => {
    variant.selectedOptions?.forEach((opt: any) => {
      const name = opt.name.toLowerCase();
      if (name === "size") {
        extractedSizes.add(opt.value);
      } else if (name === "color" || name === "colour") {
        if (!extractedColors.has(opt.value)) {
          // Simple fallback hex logic based on standard color names, otherwise default to black
          const v = opt.value.toLowerCase();
          let hex = "#000000";
          if (v.includes("red")) hex = "#ef4444";
          if (v.includes("blue")) hex = "#3b82f6";
          if (v.includes("green")) hex = "#22c55e";
          if (v.includes("gray") || v.includes("grey")) hex = "#6b7280";
          if (v.includes("white")) hex = "#ffffff";
          extractedColors.set(opt.value, hex);
        }
      }
    });
  });

  const sizes = extractedSizes.size > 0 ? Array.from(extractedSizes) : ["XS", "S", "M", "L", "XL"];
  const colors = extractedColors.size > 0 
    ? Array.from(extractedColors.entries()).map(([name, hex]) => ({ name, hex }))
    : [{ name: "Default", hex: "#000000" }];

  // Extract numeric id from Shopify GID (e.g. "gid://shopify/Product/12345" -> 12345)
  const gid: string = node.id ?? "";
  const numericId = parseInt(gid.split("/").pop() ?? "0", 10) || Math.abs(hashCode(gid));
  const slug = node.handle ?? "";
  
  // Find local product to override images and descriptions
  const localProduct = defaultProducts.find((p) => p.slug === slug);
  
  return {
    id: numericId,
    title: node.title ?? localProduct?.title ?? "",
    subtitle: localProduct?.subtitle ?? node.description?.split(".")[0] ?? "",
    description: localProduct?.description ?? node.description ?? "",
    price,
    slug,
    fabric: localProduct?.fabric ?? "",
    sizes,
    colors,
    images: localProduct?.images ?? images,
    badge: localProduct?.badge ?? undefined,
    rating: localProduct?.rating ?? 0,
    reviewCount: localProduct?.reviewCount ?? 0,
    sizeGuide: localProduct?.sizeGuide ?? "",
    reviews: localProduct?.reviews ?? [],
    aspectClass: localProduct?.aspectClass ?? "",
    originalPrice: localProduct?.originalPrice ?? undefined,
    shopifyVariants
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState<boolean>(true);

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

// Helper to find the Shopify variant ID that matches the selected options
export function getVariantId(product: Product, size: string, color: string): string | undefined {
  if (!product.shopifyVariants) return undefined;
  
  const match = product.shopifyVariants.find((variant) => {
    const vSize = variant.selectedOptions.find(o => o.name.toLowerCase() === "size")?.value;
    const vColor = variant.selectedOptions.find(o => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour")?.value;
    return vSize === size && vColor === color;
  });

  // If no exact match, fallback to the first available variant (some products might only have 1 default variant)
  if (!match && product.shopifyVariants.length > 0) {
    return product.shopifyVariants[0].id;
  }
  
  return match?.id;
}
