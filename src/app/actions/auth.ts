"use server";

import { cookies } from "next/headers";
import { shopifyFetch } from "@/lib/shopify";
import {
  customerAccessTokenCreateMutation,
  customerCreateMutation,
  getCustomerQuery,
} from "@/lib/shopify/queries";

const COOKIE_NAME = "modestus_customer_token";

export async function loginCustomer(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    const res = await shopifyFetch({
      query: customerAccessTokenCreateMutation,
      variables: {
        input: { email, password },
      },
      cache: "no-store",
    });

    const data = res.body?.data?.customerAccessTokenCreate;

    if (data?.customerUserErrors?.length > 0) {
      return { error: data.customerUserErrors[0].message };
    }

    const accessToken = data?.customerAccessToken?.accessToken;

    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return { success: true };
    }

    return { error: "Invalid credentials." };
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred during login." };
  }
}

export async function signupCustomer(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const [firstName, ...lastNameParts] = name.split(" ");
  const lastName = lastNameParts.join(" ") || undefined;

  try {
    // 1. Create the customer
    const createRes = await shopifyFetch({
      query: customerCreateMutation,
      variables: {
        input: {
          firstName,
          lastName,
          email,
          password,
        },
      },
      cache: "no-store",
    });

    const createData = createRes.body?.data?.customerCreate;

    if (createData?.customerUserErrors?.length > 0) {
      return { error: createData.customerUserErrors[0].message };
    }

    // 2. Log them in to get the access token
    return await loginCustomer(prevState, formData);
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred during signup." };
  }
}

export async function logoutCustomer() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function getCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const res = await shopifyFetch({
      query: getCustomerQuery,
      variables: {
        customerAccessToken: token,
      },
      cache: "no-store",
    });

    return res.body?.data?.customer || null;
  } catch (error) {
    console.error("Get customer error:", error);
    return null;
  }
}
