"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCustomer } = useAuth();
  const prefillEmail = searchParams.get("email") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(prefillEmail ? "This email already has an account. Please sign in below." : "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(null, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        await refreshCustomer();
        const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
        router.push(redirect);
        router.refresh();
      }
    });
  };

  const handleGoogleLogin = async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/`,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to store
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-5xl text-white mb-2 tracking-wide" style={{ fontFamily: "var(--font-cerkiymo), serif" }}>
            modestus
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-[0.15em] uppercase">Sign in to your account</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-white text-xl font-bold">Welcome back</h2>
            <p className="text-white/40 text-sm mt-1">Enter your credentials to continue shopping</p>
          </div>

          {info && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-indigo-300 text-sm mb-5">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={prefillEmail}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-white/60 text-xs font-semibold uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 mt-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-transparent backdrop-blur-xl text-white/40 uppercase tracking-widest font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-white/5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <LoginContent />
    </Suspense>
  );
}
