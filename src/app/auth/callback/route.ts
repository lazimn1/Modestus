import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isSecure =
          request.headers.get("x-forwarded-proto") === "https" ||
          request.url.startsWith("https");
        const protocol = isSecure ? "https" : "http";
        if (forwardedHost) {
          return NextResponse.redirect(`${protocol}://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not authenticate with Google`
  );
}
