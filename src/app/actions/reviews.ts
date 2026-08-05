"use server";

import { shopifyAdminFetch } from "@/lib/shopify";
import { getCustomerToken } from "./auth";

const GET_PRODUCT_REVIEWS_QUERY = `
  query getProductReviews($id: ID!) {
    product(id: $id) {
      metafield(namespace: "custom", key: "product_reviews") {
        id
        value
      }
    }
  }
`;

const SET_METAFIELD_MUTATION = `
  mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

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

// Generates a random avatar color for new reviews
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

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    // Ensure productId is formatted properly if it's not a gid
    const id = productId.includes("gid://") ? productId : `gid://shopify/Product/${productId}`;
    
    const res = await shopifyAdminFetch({
      query: GET_PRODUCT_REVIEWS_QUERY,
      variables: { id },
      cache: "no-store",
    });

    const metafield = res.body?.data?.product?.metafield;
    if (!metafield || !metafield.value) {
      return [];
    }

    return JSON.parse(metafield.value);
  } catch (error) {
    console.error("Failed to get product reviews:", error);
    return [];
  }
}

export async function submitProductReview(
  productId: string,
  rating: number,
  text: string,
  authorName: string
) {
  try {
    // 1. Verify user is logged in
    const token = await getCustomerToken();
    if (!token) {
      return { error: "You must be signed in to submit a review." };
    }

    if (!rating || rating < 1 || rating > 5) {
      return { error: "Invalid rating." };
    }
    if (!text || text.trim().length === 0) {
      return { error: "Review text cannot be empty." };
    }

    const id = productId.includes("gid://") ? productId : `gid://shopify/Product/${productId}`;

    // 2. Fetch existing reviews
    const existingReviews = await getProductReviews(id);

    // 3. Create the new review object
    const newReview: Review = {
      id: Date.now(),
      author: authorName,
      location: "Verified Buyer",
      rating,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      text: text.trim(),
      initials: authorName.substring(0, 2).toUpperCase(),
      avatarColor: getRandomColor(),
    };

    const updatedReviews = [newReview, ...existingReviews];

    // 4. Save back to Shopify Metafield
    const res = await shopifyAdminFetch({
      query: SET_METAFIELD_MUTATION,
      variables: {
        metafields: [
          {
            ownerId: id,
            namespace: "custom",
            key: "product_reviews",
            type: "json",
            value: JSON.stringify(updatedReviews),
          },
        ],
      },
      cache: "no-store",
    });

    const errors = res.body?.data?.metafieldsSet?.userErrors;
    if (errors && errors.length > 0) {
      console.error("Metafield Set Error:", errors);
      return { error: "Failed to save review." };
    }

    return { success: true, reviews: updatedReviews };
  } catch (error) {
    console.error("Submit review error:", error);
    return { error: "An unexpected error occurred." };
  }
}
