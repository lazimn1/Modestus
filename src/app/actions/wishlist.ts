"use server";

import { getCustomerAction } from "./auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function syncWishlistAction(localWishlistProductIds: number[]) {
  try {
    const customer = await getCustomerAction();
    if (!customer) {
      return { success: false, error: "Not authenticated" };
    }

    const customerId = customer.id;

    // 1. Get existing wishlist from Supabase
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/wishlists?customer_id=eq.${encodeURIComponent(customerId)}&select=product_id`,
      {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("Supabase GET error:", await res.text());
      return { success: false, error: "Failed to fetch wishlist" };
    }

    const data = await res.json();
    const existingProductIds = data.map((row: any) => Number(row.product_id));

    // 2. Identify missing items from local wishlist
    const missingProductIds = localWishlistProductIds.filter(
      (id) => !existingProductIds.includes(id)
    );

    // 3. Insert missing items to Supabase
    if (missingProductIds.length > 0) {
      const insertData = missingProductIds.map((id) => ({
        customer_id: customerId,
        product_id: id.toString(),
      }));

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/wishlists`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(insertData),
      });

      if (!insertRes.ok) {
        console.error("Supabase POST error:", await insertRes.text());
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
    const customer = await getCustomerAction();
    if (!customer) {
      return { success: false, error: "Not authenticated" };
    }

    const customerId = customer.id;

    if (isAdding) {
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/wishlists`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          customer_id: customerId,
          product_id: productId.toString(),
        }),
      });

      if (!insertRes.ok) {
        console.error("Supabase POST error:", await insertRes.text());
        return { success: false, error: "Failed to add to wishlist" };
      }
    } else {
      const deleteRes = await fetch(
        `${SUPABASE_URL}/rest/v1/wishlists?customer_id=eq.${encodeURIComponent(
          customerId
        )}&product_id=eq.${productId}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_KEY!,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!deleteRes.ok) {
        console.error("Supabase DELETE error:", await deleteRes.text());
        return { success: false, error: "Failed to remove from wishlist" };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle wishlist:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
