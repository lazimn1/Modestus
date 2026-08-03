import { NextResponse } from "next/server";
import { logoutAction } from "@/app/actions/auth";

export async function POST() {
  await logoutAction();
  return NextResponse.json({ success: true });
}
