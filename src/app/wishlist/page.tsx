import type { Metadata } from "next";
import WishlistPage from "@/components/commerce/WishlistPage";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Save and revisit your favourite Modestus styles.",
};

export default function Page() {
  return <WishlistPage />;
}
