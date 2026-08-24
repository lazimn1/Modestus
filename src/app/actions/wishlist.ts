"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function syncWishlistAction(localWishlistProductIds: number[]) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = user.id;

    // 1. Get existing wishlist from Supabase
    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase GET error:", error.message);
      return { success: false, error: "Failed to fetch wishlist" };
    }

    const existingProductIds = data.map((row: any) => Number(row.product_id));

    // 2. Identify missing items from local wishlist
    const missingProductIds = localWishlistProductIds.filter(
      (id) => !existingProductIds.includes(id)
    );

    // 3. Insert missing items to Supabase
    if (missingProductIds.length > 0) {
      const insertData = missingProductIds.map((id) => ({
        user_id: userId,
        product_id: id.toString(),
      }));

      const { error: insertError } = await supabase
        .from("wishlists")
        .insert(insertData);

      if (insertError) {
        console.error("Supabase POST error:", insertError.message);
      }
    }

    // 4. Return the merged unique set of IDs
    const mergedIds = Array.from(new Set([...existingProductIds, ...localWishlistProductIds]));
    return { success: true, productIds: mergedIds };
  } catch (error) {
    console.error("Failed to sync wishlist:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleWishlistAction(productId: number, isAdding: boolean) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = user.id;

    if (isAdding) {
      const { error: insertError } = await supabase
        .from("wishlists")
        .insert({
          user_id: userId,
          product_id: productId.toString(),
        });

      if (insertError) {
        console.error("Supabase POST error:", insertError.message);
        return { success: false, error: "Failed to add to wishlist" };
      }
    } else {
      const { error: deleteError } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId.toString());

      if (deleteError) {
        console.error("Supabase DELETE error:", deleteError.message);
        return { success: false, error: "Failed to remove from wishlist" };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle wishlist:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
