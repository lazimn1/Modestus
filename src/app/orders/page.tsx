import type { Metadata } from "next";
import OrdersPage from "@/components/commerce/OrdersPage";

export const metadata: Metadata = {
  title: "Orders",
  description: "View your Modestus order history.",
};

export default function Page() {
  return <OrdersPage />;
}
