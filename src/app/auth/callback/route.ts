import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // PKCE flow (Server-Side)
  const code = searchParams.get("code");
  // Implicit flow (Email Link)
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as string | null;
  
  // Where to redirect after success
  let next = searchParams.get("next") ?? "/";
  if (type === "recovery") {
    next = "/reset-password";
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else if (token_hash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If no code or token_hash, but we have a hash fragment (implicit flow), 
  // the client will handle it. We should just redirect to 'next' if it's there.
  // Wait, if it's implicit flow, the server doesn't see the hash.
  // But if the URL was literally /auth/callback#access_token=..., searchParams are empty.
  // We can just redirect to origin/next.
  return NextResponse.redirect(`${origin}${next}`);
}
