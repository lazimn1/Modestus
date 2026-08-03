"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetUrl = searchParams.get("url");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!resetUrl) {
    return (
      <div className="text-center space-y-4 py-4">
        <AlertCircle className="w-14 h-14 text-red-400 mx-auto" />
        <h2 className="text-white text-xl font-bold">Invalid Reset Link</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          This password reset link is missing required information. Please request a new reset link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
        <h2 className="text-white text-xl font-bold">Password Updated!</h2>
        <p className="text-white/50 text-sm">
          Your password has been changed. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("resetUrl", resetUrl);

    startTransition(async () => {
      const result = await resetPasswordAction(null, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    });
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold">Set new password</h2>
        <p className="text-white/40 text-sm mt-1">Enter a new password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="password" className="text-white/60 text-xs font-semibold uppercase tracking-wider">
            New Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={5}
              autoComplete="new-password"
              placeholder="Min. 5 characters"
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

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-white/60 text-xs font-semibold uppercase tracking-wider">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              minLength={5}
              autoComplete="new-password"
              placeholder="Repeat new password"
              className="w-full pl-11 pr-12 py-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Updating password...</>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <Link href="/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-5xl text-white mb-2 tracking-wide" style={{ fontFamily: "var(--font-cerkiymo), serif" }}>
            modestus
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-[0.15em] uppercase">Reset Password</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          }>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
