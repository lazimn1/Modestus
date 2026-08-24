import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, products as defaultProducts, formatINR, Product } from "@/lib/products";
import ImageGallery from "@/components/pdp/ImageGallery";
import ProductInfo from "@/components/pdp/ProductInfo";
import ReviewsSection from "@/components/pdp/ReviewsSection";
import { getProductReviews } from "@/app/actions/reviews";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Force Next.js and Vercel to dynamically render this page on every request with ZERO caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";



async function fetchProduct(slug: string): Promise<Product | undefined> {
  return defaultProducts.find((p) => p.slug === slug);
}

async function fetchAllProducts(): Promise<Product[]> {
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

  if (!product) notFound();

  const allProducts = await fetchAllProducts();
  const reviews = await getProductReviews(product.id);
  const initialReviews = reviews.length > 0 ? reviews : product.reviews;

  return (
    <main className="min-h-screen bg-[#faf7f2] font-sans">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="px-4 sm:px-6 md:px-12 py-3 sm:py-4 border-b border-[#e7e1d4] bg-[#faf7f2] pt-24 md:pt-32"
      >
        <ol className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#78716c]">
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
        productId={product.id.toString()}
        initialReviews={initialReviews}
        productTitle={product.title}
      />

      {/* You May Also Like */}
      <section className="bg-[#fcfaf7] border-t border-[#e7e1d4] py-12 sm:py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest font-bold text-[#78716c] mb-1">
                Continue Shopping
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#2a2621] font-normal tracking-tight">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden md:block text-xs sm:text-sm font-bold uppercase tracking-widest text-[#2a2621] border-b border-[#2a2621] pb-0.5 hover:opacity-60 transition-opacity"
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
                      <span className="absolute top-2 left-2 bg-[#2a2621] text-[#faf7f2] text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 sm:py-1 rounded-full">
                        {related.badge}
                      </span>
                    )}
                  </div>
                  <div className="px-1">
                    <p className="text-sm font-bold text-[#2a2621] truncate">{related.title}</p>
                    <p className="text-sm font-bold text-[#2a2621] mt-0.5">{formatINR(related.price)}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
