import AdminProductsManager from "@/components/admin/AdminProductsManager";
import { getAdminProductsAction } from "@/app/actions/admin";
import { products as defaultProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  const { products } = await getAdminProductsAction();

  return <AdminProductsManager initialProducts={products && products.length > 0 ? products : defaultProducts} />;
}
