"use client";

import { useEffect, useState } from "react";
import AdminProductsManager from "@/components/admin/AdminProductsManager";
import { mapShopifyToProduct } from "@/lib/useProducts";
import { products as defaultProducts, Product } from "@/lib/products";
import { getProducts } from "@/lib/shopify/queries";

export default function AdminProductsPage() {
  const [initialProducts, setInitialProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const nodes = await getProducts();
        if (nodes && nodes.length > 0) {
          setInitialProducts(nodes.map(mapShopifyToProduct));
        }
      } catch (err) {
        console.error("Error fetching Shopify products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900" />
      </div>
    );
  }

  return <AdminProductsManager initialProducts={initialProducts} />;
}
