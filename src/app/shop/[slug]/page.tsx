import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, products as defaultProducts, formatINR, Product } from "@/lib/products";
import ImageGallery from "@/components/pdp/ImageGallery";
import ProductInfo from "@/components/pdp/ProductInfo";
import ReviewsSection from "@/components/pdp/ReviewsSection";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Force Next.js and Vercel to dynamically render this page on every request with ZERO caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { getProduct, getProducts } from "@/lib/shopify/queries";

// Local helper to map Shopify node to Product
function mapShopifyToProduct(node: any): Product {
  const price = parseFloat(node?.priceRange?.maxVariantPrice?.amount ?? "0");
  const images = node?.images?.edges?.map((edge: any) => edge.node.url) || [];
  return {
    id: node?.id ?? 0,
    title: node?.title ?? "",
    subtitle: node?.description?.split(".")[0] ?? "",
    description: node?.description ?? "",
    price,
    slug: node?.handle ?? "",
    fabric: "",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Default", hex: "#000000" }],
    images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80"],
    badge: undefined,
    rating: 0,
    reviewCount: 0,
    sizeGuide: "",
    reviews: [],
    aspectClass: "",
    originalPrice: undefined,
  };
}

async function fetchProduct(slug: string): Promise<Product | undefined> {
  try {
    const node = await getProduct(slug);
    if (node) {
      return mapShopifyToProduct(node);
    }
  } catch (err) {
    console.error("fetchProduct exception:", err);
  }
  return getProductBySlug(slug);
}

async function fetchAllProducts(): Promise<Product[]> {
  try {
    const nodes = await getProducts();
    if (nodes && nodes.length > 0) {
      return nodes.map(mapShopifyToProduct);
    }
  } catch (err) {
    console.error("fetchAllProducts exception:", err);
  }
  return defaultProducts;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: `${product.subtitle} — ${product.description.slice(0, 140)}...`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  const allProducts = await fetchAllProducts();

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#faf7f2] font-sans">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="px-4 sm:px-6 md:px-12 py-3 sm:py-4 border-b border-[#e7e1d4] bg-[#faf7f2] pt-24 md:pt-32"
      >
        <ol className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[#78716c]">
          <li>
            <Link href="/" className="hover:text-[#2a2621] transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <li>
            <Link href="/shop" className="hover:text-[#2a2621] transition-colors">
              Shop
            </Link>
          </li>
          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <li className="text-[#2a2621] truncate max-w-[150px] sm:max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      {/* Main Product Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-start">
          {/* Left: Image Gallery */}
          <ImageGallery images={product.images} title={product.title} />

          {/* Right: Product Info */}
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection
        reviews={product.reviews}
        rating={product.rating}
        reviewCount={product.reviewCount}
        productTitle={product.title}
      />

      {/* You May Also Like */}
      <section className="bg-[#fcfaf7] border-t border-[#e7e1d4] py-12 sm:py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-[#78716c] mb-1">
                Continue Shopping
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#2a2621] font-normal tracking-tight">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden md:block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#2a2621] border-b border-[#2a2621] pb-0.5 hover:opacity-60 transition-opacity"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {allProducts
              .filter((p) => p.slug !== slug && p.id !== product.id)
              .slice(0, 4)
              .map((related) => (
                <Link key={related.id} href={`/shop/${related.slug}`} className="group block bg-[#fcfaf7] border border-[#e7e1d4] rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#e8e2d5] border border-[#dad2c2]/50 rounded-lg sm:rounded-xl mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={related.images[0]}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {related.badge && (
                      <span className="absolute top-2 left-2 bg-[#2a2621] text-[#faf7f2] text-[6px] sm:text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 sm:py-1 rounded-full">
                        {related.badge}
                      </span>
                    )}
                  </div>
                  <div className="px-1">
                    <p className="text-[10px] sm:text-xs font-bold text-[#2a2621] truncate">{related.title}</p>
                    <p className="text-[10px] sm:text-xs font-bold text-[#2a2621] mt-0.5">{formatINR(related.price)}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
