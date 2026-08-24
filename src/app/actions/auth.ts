"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Exported Server Actions ──────────────────────────────────────────────────

export async function loginAction(_prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString()?.trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        return { error: "Invalid email or password. Please try again." };
      }
      return { error: error.message };
    }

    return { success: true };
  } catch {
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function signupAction(_prevState: any, formData: FormData) {
  const firstName = formData.get("firstName")?.toString()?.trim() ?? "";
  const lastName = formData.get("lastName")?.toString()?.trim() ?? "";
  const email = formData.get("email")?.toString()?.trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please fill in all required fields." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, full_name: `${firstName} ${lastName}`.trim() },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return {
          redirectToLogin: true,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }
      return { error: error.message };
    }

    return { success: true };
  } catch {
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // ignore errors on logout
  }
  return { success: true };
}

export async function forgotPasswordAction(_prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString()?.trim();

  if (!email) return { error: "Please enter your email address." };

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/reset-password`,
    });

    if (error) return { error: error.message };

    // Always return success for security — don't reveal if email exists
    return { success: true };
  } catch {
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function resetPasswordAction(_prevState: any, formData: FormData) {
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!password) return { error: "Invalid reset link." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) return { error: error.message };

    return { success: true };
  } catch {
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function getCustomerAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    const meta = user.user_metadata ?? {};
    return {
      id: user.id,
      email: user.email ?? "",
      firstName: meta.firstName ?? meta.first_name ?? "",
      lastName: meta.lastName ?? meta.last_name ?? "",
      phone: meta.phone ?? "",
    };
  } catch {
    return null;
  }
}

export async function updateCustomerAction(_prevState: any, formData: FormData) {
  const firstName = formData.get("firstName")?.toString()?.trim();
  const lastName = formData.get("lastName")?.toString()?.trim();
  const phone = formData.get("phone")?.toString()?.trim();
  const newPassword = formData.get("newPassword")?.toString();

  try {
    const supabase = await createSupabaseServerClient();

    const updateData: any = {
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
      },
    };

    if (newPassword) {
      if (newPassword.length < 6) return { error: "New password must be at least 6 characters." };
      updateData.password = newPassword;
    }

    const { error } = await supabase.auth.updateUser(updateData);
    if (error) return { error: error.message };

    return { success: true };
  } catch {
    return { error: "Failed to update profile. Please try again." };
  }
}
