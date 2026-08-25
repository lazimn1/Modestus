import AdminProductsManager from "@/components/admin/AdminProductsManager";
import { getAdminProductsAction } from "@/app/actions/admin";

export default async function AdminProductsPage() {
  const { products } = await getAdminProductsAction();

  return <AdminProductsManager initialProducts={products || []} />;
}
