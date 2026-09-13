"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export type CartSyncItem = {
  productId: number;
  quantity: number;
  size: string;
  color: string;
};

/**
 * Syncs the local cart with the database cart.
 * If an item exists locally but not in DB, it is added.
 * If an item exists in both, the local quantity is used.
 * Returns the final merged list of items from the DB.
 */
export async function syncCartAction(localCart: CartSyncItem[]) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // First, fetch the current DB cart
    const { data: dbCart, error: fetchError } = await supabase
      .from("carts")
      .select("product_id, quantity, size, color")
      .eq("user_id", userId);

    if (fetchError) {
      console.error("Error fetching db cart:", fetchError);
      return { success: false, error: fetchError.message };
    }

    // Upsert all local items into the database
    // (If the user just logged in on a new device, their local cart will overwrite the DB cart for overlapping items)
    if (localCart.length > 0) {
      const upsertPayload = localCart.map(item => ({
        user_id: userId,
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const { error: upsertError } = await supabase
        .from("carts")
        .upsert(upsertPayload, {
          onConflict: 'user_id, product_id, size, color'
        });

      if (upsertError) {
        console.error("Error upserting local cart items:", upsertError);
      }
    }

    // Re-fetch the final merged cart to return to the client
    const { data: finalCart, error: finalFetchError } = await supabase
      .from("carts")
      .select("product_id, quantity, size, color, added_at")
      .eq("user_id", userId);

    if (finalFetchError) {
      return { success: false, error: finalFetchError.message };
    }

    return { success: true, cartItems: finalCart };
  } catch (err) {
    console.error("Exception in syncCartAction:", err);
    return { success: false, error: "Server error" };
  }
}

/**
 * Updates a specific cart item in the database.
 * If quantity is 0, the item is deleted.
 */
export async function updateCartAction(
  productId: number,
  size: string,
  color: string,
  quantity: number
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    if (quantity <= 0) {
      const { error } = await supabase
        .from("carts")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
        .eq("size", size)
        .eq("color", color);
      
      if (error) {
        console.error("Error deleting cart item:", error);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from("carts")
        .upsert({
          user_id: userId,
          product_id: productId,
          quantity: quantity,
          size: size,
          color: color,
        }, {
          onConflict: 'user_id, product_id, size, color'
        });
      
      if (error) {
        console.error("Error upserting cart item:", error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Exception in updateCartAction:", err);
    return { success: false, error: "Server error" };
  }
}

/**
 * Clears the entire cart for the current user.
 */
export async function clearCartAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("carts")
      .delete()
      .eq("user_id", session.user.id);
    
    if (error) {
      console.error("Error clearing cart:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Exception in clearCartAction:", err);
    return { success: false, error: "Server error" };
  }
}
