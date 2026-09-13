import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia',
});

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.redirect(`${origin}/checkout?error=Missing order ID`);
    }

    const supabase = await createSupabaseServerClient();
    
    // Fetch order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.redirect(`${origin}/checkout?error=Order not found`);
    }

    // Convert items into Stripe line items
    // order.items is an array of { productId, quantity, size, color }
    // We need to fetch product names and images for the checkout session
    const { data: products } = await supabase
      .from('products')
      .select('id, title, price')
      .in('id', order.items.map((i: any) => i.productId));

    const line_items = order.items.map((item: any) => {
      const dbProduct = products?.find(p => p.id === item.productId);
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: dbProduct?.title || `Product #${item.productId}`,
            description: `Size: ${item.size} | Color: ${item.color}`,
          },
          unit_amount: (dbProduct?.price || 0) * 100, // Stripe expects paise (cents)
        },
        quantity: item.quantity,
      };
    });

    // Add shipping cost if applicable
    if (order.shipping > 0) {
      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Standard Shipping',
          },
          unit_amount: order.shipping * 100,
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/orders?success=true`,
      cancel_url: `${origin}/checkout?error=Payment cancelled`,
      client_reference_id: orderId, // Crucial for webhook to identify the order
      customer_email: order.email,
    });

    if (session.url) {
      return NextResponse.redirect(session.url);
    }

    throw new Error('Failed to create Stripe session');

  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/checkout?error=Payment service unavailable`);
  }
}
