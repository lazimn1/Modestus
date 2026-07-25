"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AdminProductsManager from "@/components/admin/AdminProductsManager";
import { mapDbToProduct } from "@/lib/useProducts";
import { products as defaultProducts, Product } from "@/lib/products";

export default function AdminProductsPage() {
  const [initialProducts, setInitialProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: rows } = await supabase
          .from("products")
          .select("*")
          .order("id", { ascending: true });

        if (rows && rows.length > 0) {
          setInitialProducts(rows.map(mapDbToProduct));
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900" />
      </div>
    );
  }

  return <AdminProductsManager initialProducts={initialProducts} />;
}
