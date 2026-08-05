"use server";

import { cookies } from "next/headers";
import { shopifyFetch } from "@/lib/shopify";

const CUSTOMER_TOKEN_COOKIE = "shopify_customer_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ─── GraphQL Mutations & Queries ──────────────────────────────────────────────

const customerAccessTokenCreateMutation = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerCreateMutation = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerRecoverMutation = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerResetByUrlMutation = `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customer {
        id
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerUpdateMutation = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const getCustomerQuery = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        id
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            fulfillmentStatus
            financialStatus
            currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    image {
                      url
                      altText
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const customerAddressCreateMutation = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerAddressUpdateMutation = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerAddressDeleteMutation = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerDefaultAddressUpdateMutation = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function setCustomerToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function getCustomerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value ?? null;
}

// ─── Exported Server Actions ──────────────────────────────────────────────────

export async function loginAction(_prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString()?.trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  try {
    const res = await shopifyFetch({
      query: customerAccessTokenCreateMutation,
      variables: { input: { email, password } },
      cache: "no-store",
    });

    const data = res.body?.data?.customerAccessTokenCreate;
    const errors = data?.customerUserErrors;

    if (errors?.length > 0) {
      const code = errors[0].code;
      if (code === "UNIDENTIFIED_CUSTOMER") {
        return { error: "No account found with these credentials. If you registered via email invitation, please sign up fresh on our website instead." };
      }
      return { error: errors[0].message };
    }

    const accessToken = data?.customerAccessToken?.accessToken;
    if (!accessToken) return { error: "Login failed. Please try again." };

    await setCustomerToken(accessToken);
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
  const acceptsMarketing = formData.get("acceptsMarketing") === "on";

  if (!email || !password) {
    return { error: "Please fill in all required fields." };
  }
  if (password.length < 5) {
    return { error: "Password must be at least 5 characters." };
  }

  try {
    const createRes = await shopifyFetch({
      query: customerCreateMutation,
      variables: {
        input: { firstName, lastName, email, password, acceptsMarketing },
      },
      cache: "no-store",
    });

    const createData = createRes.body?.data?.customerCreate;
    const createErrors = createData?.customerUserErrors;

    if (createErrors?.length > 0) {
      const code = createErrors[0].code;
      // CUSTOMER_DISABLED = account exists (created by admin) but not yet activated
      // TAKEN = account already self-registered
      // In both cases, redirect the user to login — no activation flow needed
      if (code === "CUSTOMER_DISABLED" || code === "TAKEN") {
        return { redirectToLogin: true, error: "An account with this email already exists. Please sign in instead." };
      }
      return { error: createErrors[0].message };
    }

    // Auto-login after signup
    const loginRes = await shopifyFetch({
      query: customerAccessTokenCreateMutation,
      variables: { input: { email, password } },
      cache: "no-store",
    });

    const loginData = loginRes.body?.data?.customerAccessTokenCreate;
    const accessToken = loginData?.customerAccessToken?.accessToken;

    if (accessToken) {
      await setCustomerToken(accessToken);
      return { success: true };
    }

    return { success: true, needsLogin: true };
  } catch {
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_TOKEN_COOKIE);
  return { success: true };
}

export async function forgotPasswordAction(_prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString()?.trim();

  if (!email) return { error: "Please enter your email address." };

  try {
    const res = await shopifyFetch({
      query: customerRecoverMutation,
      variables: { email },
      cache: "no-store",
    });

    const errors = res.body?.data?.customerRecover?.customerUserErrors;
    if (errors?.length > 0) {
      return { error: errors[0].message };
    }

    // Always return success (security - don't reveal if email exists)
    return { success: true };
  } catch {
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function resetPasswordAction(_prevState: any, formData: FormData) {
  const resetUrl = formData.get("resetUrl")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!resetUrl || !password) return { error: "Invalid reset link." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (password.length < 5) return { error: "Password must be at least 5 characters." };

  try {
    const res = await shopifyFetch({
      query: customerResetByUrlMutation,
      variables: { resetUrl, password },
      cache: "no-store",
    });

    const data = res.body?.data?.customerResetByUrl;
    const errors = data?.customerUserErrors;

    if (errors?.length > 0) return { error: errors[0].message };

    const accessToken = data?.customerAccessToken?.accessToken;
    if (accessToken) {
      await setCustomerToken(accessToken);
      return { success: true };
    }

    return { error: "Password reset failed. The link may have expired." };
  } catch {
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function getCustomerAction() {
  const token = await getCustomerToken();
  if (!token) return null;

  try {
    const res = await shopifyFetch({
      query: getCustomerQuery,
      variables: { customerAccessToken: token },
      cache: "no-store",
    });

    return res.body?.data?.customer ?? null;
  } catch {
    return null;
  }
}

export async function updateCustomerAction(_prevState: any, formData: FormData) {
  const token = await getCustomerToken();
  if (!token) return { error: "Not authenticated." };

  const firstName = formData.get("firstName")?.toString()?.trim();
  const lastName = formData.get("lastName")?.toString()?.trim();
  const phone = formData.get("phone")?.toString()?.trim();
  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();

  const customer: any = {};
  if (firstName !== undefined) customer.firstName = firstName;
  if (lastName !== undefined) customer.lastName = lastName;
  if (phone !== undefined) customer.phone = phone || null;
  if (newPassword && currentPassword) {
    if (newPassword.length < 5) return { error: "New password must be at least 5 characters." };
    customer.password = newPassword;
  }

  try {
    const res = await shopifyFetch({
      query: customerUpdateMutation,
      variables: { customerAccessToken: token, customer },
      cache: "no-store",
    });

    const data = res.body?.data?.customerUpdate;
    const errors = data?.customerUserErrors;

    if (errors?.length > 0) return { error: errors[0].message };

    return { success: true, customer: data?.customer };
  } catch {
    return { error: "Failed to update profile. Please try again." };
  }
}

export async function createAddressAction(_prevState: any, formData: FormData) {
  const token = await getCustomerToken();
  if (!token) return { error: "Not authenticated." };

  const address = {
    address1: formData.get("address1")?.toString(),
    address2: formData.get("address2")?.toString() || undefined,
    city: formData.get("city")?.toString(),
    province: formData.get("province")?.toString() || undefined,
    country: formData.get("country")?.toString(),
    zip: formData.get("zip")?.toString(),
    phone: formData.get("phone")?.toString() || undefined,
  };

  try {
    const res = await shopifyFetch({
      query: customerAddressCreateMutation,
      variables: { customerAccessToken: token, address },
      cache: "no-store",
    });

    const data = res.body?.data?.customerAddressCreate;
    const errors = data?.customerUserErrors;
    if (errors?.length > 0) return { error: errors[0].message };

    return { success: true };
  } catch {
    return { error: "Failed to add address." };
  }
}

export async function updateAddressAction(_prevState: any, formData: FormData) {
  const token = await getCustomerToken();
  if (!token) return { error: "Not authenticated." };

  const id = formData.get("id")?.toString();
  const address = {
    address1: formData.get("address1")?.toString(),
    address2: formData.get("address2")?.toString() || undefined,
    city: formData.get("city")?.toString(),
    province: formData.get("province")?.toString() || undefined,
    country: formData.get("country")?.toString(),
    zip: formData.get("zip")?.toString(),
    phone: formData.get("phone")?.toString() || undefined,
  };

  try {
    const res = await shopifyFetch({
      query: customerAddressUpdateMutation,
      variables: { customerAccessToken: token, id, address },
      cache: "no-store",
    });

    const data = res.body?.data?.customerAddressUpdate;
    const errors = data?.customerUserErrors;
    if (errors?.length > 0) return { error: errors[0].message };

    return { success: true };
  } catch {
    return { error: "Failed to update address." };
  }
}

export async function deleteAddressAction(addressId: string) {
  const token = await getCustomerToken();
  if (!token) return { error: "Not authenticated." };

  try {
    const res = await shopifyFetch({
      query: customerAddressDeleteMutation,
      variables: { customerAccessToken: token, id: addressId },
      cache: "no-store",
    });

    const data = res.body?.data?.customerAddressDelete;
    const errors = data?.customerUserErrors;
    if (errors?.length > 0) return { error: errors[0].message };

    return { success: true };
  } catch {
    return { error: "Failed to delete address." };
  }
}

export async function setDefaultAddressAction(addressId: string) {
  const token = await getCustomerToken();
  if (!token) return { error: "Not authenticated." };

  try {
    const res = await shopifyFetch({
      query: customerDefaultAddressUpdateMutation,
      variables: { customerAccessToken: token, addressId },
      cache: "no-store",
    });

    const data = res.body?.data?.customerDefaultAddressUpdate;
    const errors = data?.customerUserErrors;
    if (errors?.length > 0) return { error: errors[0].message };

    return { success: true };
  } catch {
    return { error: "Failed to set default address." };
  }
}
