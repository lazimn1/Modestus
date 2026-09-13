"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    // When the user lands on this page via the email link, Supabase will parse the URL hash
    // and establish a session. We can just wait for it.
    const supabase = createSupabaseBrowserClient();
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery flow initiated");
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await resetPasswordAction(null, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setDone(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="text-center mb-10">
          <h1 className="text-5xl text-white mb-2 tracking-wide" style={{ fontFamily: "var(--font-cerkiymo), serif" }}>
            modestus
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-[0.15em] uppercase">Set New Password</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
              <h2 className="text-white text-xl font-bold">Password Updated</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Your password has been successfully reset. You will be redirected to the login page momentarily.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-white text-xl font-bold">Enter new password</h2>
                <p className="text-white/40 text-sm mt-1">
                  Please choose a strong password with at least 6 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-white/60 text-xs font-semibold uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Save Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
