"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/products";
import { mapShopifyToProduct } from "@/lib/useProducts";
import { getAdminProductsAction } from "@/app/actions/admin";
import {
  Search,
  RefreshCw,
  ExternalLink,
  Package,
  Image as ImageIcon
} from "lucide-react";
import { formatINR } from "@/lib/products";

interface AdminProductsManagerProps {
  initialProducts: Product[];
}

export default function AdminProductsManager({ initialProducts }: AdminProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const { products: fetched } = await getAdminProductsAction();
      if (fetched && fetched.length > 0) {
        setProducts(fetched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return [product.title, product.subtitle, product.slug]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      }),
    [products, searchTerm]
  );

  return (
    <div className="flex flex-col h-full bg-[#faf7f2]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 border-b border-[#dad2c2]/50 bg-white">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#2a2621]">Products</h1>
          <p className="text-[#78716c] text-sm mt-1">
            Your products are managed directly in Supabase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshProducts}
            disabled={loading}
            className="h-10 px-4 rounded-full border border-[#dad2c2] text-[#2a2621] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#e8e2d5] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c]" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 h-11 bg-white border border-[#dad2c2] rounded-full text-sm outline-none focus:border-[#2a2621] transition-colors"
          />
        </div>
        <div className="text-sm text-[#78716c] shrink-0">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto p-6 sm:p-8 pt-0">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-[#e8e2d5] rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-[#78716c]" />
            </div>
            <h3 className="font-display text-xl text-[#2a2621] mb-2">No products found</h3>
            <p className="text-[#78716c] text-sm max-w-md">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Your store doesn't have any products yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#dad2c2]/50 overflow-hidden group hover:border-[#2a2621]/30 transition-colors"
              >
                <div className="aspect-[4/5] relative bg-[#f5f5f5]">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#78716c]">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#2a2621]">
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-bold text-[#2a2621] text-sm line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-xs text-[#78716c] mt-0.5 line-clamp-1">
                        {product.subtitle || "No subtitle"}
                      </p>
                    </div>
                    <span className="font-bold text-[#2a2621] text-sm shrink-0">
                      {formatINR(product.price)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 bg-[#f5f5f5] text-[#78716c] text-[10px] font-medium rounded-md">
                      {product.sizes.length} sizes
                    </span>
                    <span className="px-2 py-0.5 bg-[#f5f5f5] text-[#78716c] text-[10px] font-medium rounded-md">
                      {product.colors.length} colors
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
