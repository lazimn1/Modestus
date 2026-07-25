import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import AdminProductsManager from '@/components/admin/AdminProductsManager';
import { mapDbToProduct } from '@/lib/useProducts';
import { products as defaultProducts } from '@/lib/products';

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: rows } = await supabase.from('products').select('*').order('id', { ascending: true });
  
  const initialProducts = rows && rows.length > 0
    ? rows.map(mapDbToProduct)
    : defaultProducts;

  return <AdminProductsManager initialProducts={initialProducts} />;
}
