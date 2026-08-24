"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export type Review = {
  id: number;
  author: string;
  location: string;
  rating: number;
  date: string;
  text: string;
  initials: string;
  avatarColor: string;
};

const AVATAR_COLORS = [
  "bg-amber-100 text-amber-900",
  "bg-sky-100 text-sky-900",
  "bg-rose-100 text-rose-900",
  "bg-emerald-100 text-emerald-900",
  "bg-purple-100 text-purple-900",
  "bg-indigo-100 text-indigo-900",
];

function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export async function getProductReviews(productId: string | number): Promise<Review[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews?product_id=eq.${productId}&select=*&order=id.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("Supabase GET error:", await res.text());
      return [];
    }

    const data = await res.json();
    return data.map((row: any) => ({
      id: row.id,
      author: row.author,
      location: row.location,
      rating: row.rating,
      date: row.date,
      text: row.text,
      initials: row.initials,
      avatarColor: row.avatar_color,
    }));
  } catch (error) {
    console.error("Failed to get product reviews:", error);
    return [];
  }
}

export async function submitProductReview(
  productId: string | number,
  rating: number,
  text: string,
  authorName: string
) {
  try {
    // Verify user is logged in via Supabase Auth
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to submit a review." };
    }

    if (!rating || rating < 1 || rating > 5) {
      return { error: "Invalid rating." };
    }
    if (!text || text.trim().length === 0) {
      return { error: "Review text cannot be empty." };
    }

    const newReview = {
      product_id: Number(productId),
      author: authorName,
      location: "Verified Buyer",
      rating,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      text: text.trim(),
      initials: authorName.substring(0, 2).toUpperCase(),
      avatar_color: getRandomColor(),
    };

    const { error: insertError } = await supabase.from("reviews").insert(newReview);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return { error: "Failed to save review." };
    }

    const updatedReviews = await getProductReviews(productId);
    return { success: true, reviews: updatedReviews };
  } catch (error) {
    console.error("Submit review error:", error);
    return { error: "An unexpected error occurred." };
  }
}
