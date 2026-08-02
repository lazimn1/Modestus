import { NextResponse } from 'next/server';

export async function POST() {
  // No server-side session to clear — auth is client-side only
  return NextResponse.json({ success: true });
}
