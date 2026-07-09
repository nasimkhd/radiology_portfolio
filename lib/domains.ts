/**
 * Email-domain policy helpers. These run server-side during signup and admin
 * domain management. Client-side use is only for faster feedback — the server
 * is always the final authority.
 */

/** Obvious personal / consumer email domains that are never medical affiliation. */
export const PERSONAL_EMAIL_DOMAINS = new Set<string>([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "pm.me",
]);

/** Normalize an email to lowercase and trim whitespace. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Extract the domain portion after `@`. Returns "" if malformed. */
export function getEmailDomain(email: string): string {
  const normalized = normalizeEmail(email);
  const at = normalized.lastIndexOf("@");
  if (at === -1) return "";
  return normalized.slice(at + 1);
}

/** True when the domain is a known personal/consumer provider. */
export function isPersonalEmailDomain(domain: string): boolean {
  return PERSONAL_EMAIL_DOMAINS.has(domain.trim().toLowerCase());
}

/** Basic RFC-ish email format check. */
export function isValidEmail(email: string): boolean {
  const value = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Normalize a domain entered by an admin (strip protocol, leading @, path). */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
}

/** Convert an arbitrary string into a lowercase URL-safe slug. */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** True when a slug is already lowercase and URL-safe. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
