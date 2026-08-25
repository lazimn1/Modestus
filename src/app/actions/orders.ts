"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
};

export type CartItemInput = {
  productId: number;
  quantity: number;
  size: string;
  color: string;
};

export async function createOrderAction(
  cartItems: CartItemInput[],
  shippingData: ShippingAddress,
  paymentMethod: "cod" = "cod"
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to place an order." };
    }

    if (!cartItems || cartItems.length === 0) {
      return { error: "Your cart is empty." };
    }

    // Fetch product prices from DB for server-side total calculation
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, price")
      .in("id", cartItems.map((i) => i.productId));

    const priceMap: Record<number, number> = {};
    const missingProducts: number[] = [];
    
    cartItems.forEach((item) => {
      const dbProduct = (dbProducts ?? []).find(p => p.id === item.productId);
      if (dbProduct) {
        priceMap[item.productId] = dbProduct.price;
      } else {
        missingProducts.push(item.productId);
      }
    });

    if (missingProducts.length > 0) {
      return { error: "Some products in your cart are no longer available." };
    }

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (priceMap[item.productId] ?? 0) * item.quantity;
    }, 0);

    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 149;
    const total = subtotal + shipping;
    const orderId = `MOD-${Date.now().toString().slice(-6)}`;

    const { error: insertError } = await supabase.from("orders").insert({
      id: orderId,
      user_id: user.id,
      items: cartItems,
      subtotal,
      shipping,
      total,
      payment_method: paymentMethod,
      payment_status: "pending",
      status: "Confirmed",
      customer_name: shippingData.fullName,
      email: shippingData.email,
      phone: shippingData.phone,
      shipping_address: shippingData,
      placed_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Order insert error:", insertError);
      return { error: "Failed to place order. Please try again." };
    }

    return { success: true, orderId, total };
  } catch (e) {
    console.error("createOrderAction error:", e);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function getOrdersAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated", orders: [] };

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("placed_at", { ascending: false });

    if (error) return { error: error.message, orders: [] };

    return { orders: data ?? [] };
  } catch {
    return { error: "Failed to fetch orders.", orders: [] };
  }
}
