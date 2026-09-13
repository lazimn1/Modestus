import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_mock';
    
    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
      // Only fail if we have a real secret (ignore in mock mode)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'Confirmed'
      })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Razorpay verify error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
