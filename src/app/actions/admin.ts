"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";  

export async function getAdminOrdersAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated", orders: [] };

    // Admins (checked via RLS) receive ALL orders; regular users only see their own
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

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) return { error: error.message };

    return { success: true };
  } catch (e) {
    return { error: "Failed to update order status." };
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

export async function createProductAction(payload: Record<string, unknown>) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    if (error) return { error: error.message };
    return { success: true, product: data };
  } catch (e) {
    return { error: "Failed to create product." };
  }
}

export async function updateProductAction(id: number, payload: Record<string, unknown>) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { success: true, product: data };
  } catch (e) {
    return { error: "Failed to update product." };
  }
}

export async function deleteProductAction(id: number) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete product." };
  }
}
