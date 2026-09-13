import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia',
});

// Use service role key to bypass RLS for backend operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      // For local testing without a webhook secret configured yet, just parse it
      event = JSON.parse(payload) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(
        payload,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.client_reference_id;

    if (orderId) {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'Confirmed', // Or 'Processing'
        })
        .eq('id', orderId);

      if (error) {
        console.error('Failed to update order in Supabase:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      console.log(`Order ${orderId} marked as paid successfully.`);
    }
  }

  return NextResponse.json({ received: true });
}
