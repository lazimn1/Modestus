import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, products, formatINR } from "@/lib/products";
import ImageGallery from "@/components/pdp/ImageGallery";
import ProductInfo from "@/components/pdp/ProductInfo";
import ReviewsSection from "@/components/pdp/ReviewsSection";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Pre-render all known product slugs at build time
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
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
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-lightgray">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="px-6 md:px-12 py-4 border-b border-pureblack/10 bg-lightgray"
      >
        <ol className="max-w-7xl mx-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-pureblack/40">
          <li>
            <Link href="/" className="hover:text-pureblack transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="w-3 h-3" />
          <li>
            <Link href="/shop" className="hover:text-pureblack transition-colors">
              Shop
            </Link>
          </li>
          <ChevronRight className="w-3 h-3" />
          <li className="text-pureblack truncate max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      {/* Main Product Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
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
      <section className="bg-purewhite py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-pureblack/40 mb-1">
                Continue Shopping
              </p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-pureblack">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden md:block text-[10px] font-bold uppercase tracking-[0.15em] text-pureblack border-b border-pureblack pb-0.5 hover:opacity-60 transition-opacity"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products
              .filter((p) => p.slug !== slug)
              .slice(0, 4)
              .map((related) => (
                <Link key={related.id} href={`/shop/${related.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f3f0] rounded-sm mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={related.images[0]}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {related.badge && (
                      <span className="absolute top-2 left-2 bg-pureblack text-purewhite text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                        {related.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-pureblack truncate">{related.title}</p>
                  <p className="text-xs text-pureblack/50 mt-0.5">{formatINR(related.price)}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
