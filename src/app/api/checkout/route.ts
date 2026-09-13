import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_mock',
});

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.total * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: order.id,
      notes: {
        orderId: order.id,
      }
    };

    const rzpOrder = await razorpay.orders.create(options);

    return NextResponse.json({ 
      id: rzpOrder.id,
      currency: rzpOrder.currency,
      amount: rzpOrder.amount
    });

  } catch (err: any) {
    console.error('Razorpay Order Creation Error:', err);
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 500 });
  }
}
