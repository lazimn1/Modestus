import type { Metadata } from "next";
import ProductGrid from "@/components/shop/ProductGrid";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full Modestus collection — luxury modest fashion for every occasion. Abayas, co-ords, dresses, and more in premium fabrics.",
};

export default function ShopPage() {
  return (
    <main>
      <ProductGrid />
    </main>
  );
}
