"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminOrdersAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated", orders: [] };

    // The RLS policy will automatically restrict non-admins to their own orders.
    // By omitting .eq('user_id', user.id), admins will receive all orders.
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("placed_at", { ascending: false });

    if (error) return { error: error.message, orders: [] };

    return { orders: data ?? [] };
  } catch (e) {
    return { error: "Failed to fetch admin orders.", orders: [] };
  }
}

export async function getAdminProductsAction() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) return { error: error.message, products: null };

    return { products: data ?? [] };
  } catch (e) {
    return { error: "Failed to fetch admin products.", products: null };
  }
}
