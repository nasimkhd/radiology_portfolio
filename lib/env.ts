/**
 * Centralized environment access. Public values are safe for the browser;
 * the service role key is read only in server-only modules.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * True when the public Supabase env vars are present. Used to render helpful
 * "not configured yet" states instead of crashing during local setup.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Dev-only: allow Gmail and other personal domains through signup.
 * Set ALLOW_PERSONAL_EMAIL_SIGNUP=true in `.env.local` — never in production.
 */
export const allowPersonalEmailSignup =
  process.env.ALLOW_PERSONAL_EMAIL_SIGNUP === "true";

/** Resend API key for transactional email (server-only). */
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

/** Verified sender, e.g. "Radio From Scratch <hello@yourdomain.com>". Avoid noreply@. */
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "";

/** Reply-To / contact address (prefer a monitored inbox on the same domain). */
export const SITE_CONTACT_EMAIL = process.env.SITE_CONTACT_EMAIL ?? "";
