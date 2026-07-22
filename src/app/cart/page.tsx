import type { Metadata } from "next";
import CartPage from "@/components/commerce/CartPage";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected Modestus pieces and continue to checkout.",
};

export default function Page() {
  return <CartPage />;
}
