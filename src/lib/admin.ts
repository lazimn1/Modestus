export const ADMIN_EMAIL = "lazimkhadern@gmail.com";

export function isAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}
