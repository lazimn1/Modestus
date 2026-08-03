import { NextResponse } from "next/server";
import { getCustomerAction } from "@/app/actions/auth";

export async function GET() {
  const customer = await getCustomerAction();
  if (!customer) {
    return NextResponse.json({ customer: null }, { status: 401 });
  }
  return NextResponse.json({ customer });
}
