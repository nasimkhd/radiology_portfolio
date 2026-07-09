import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirectAfterAuth } from "@/lib/auth-redirect";

/**
 * Handles email confirmation links that point at this site (not supabase.co).
 *
 * Supabase Confirm signup template should use:
 * {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 *
 * See: https://supabase.com/docs/guides/auth/passwords
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/sign-in?error=verification`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    console.error("Email confirm verifyOtp failed:", error.message);
    return NextResponse.redirect(`${origin}/sign-in?error=verification`);
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/update-password`);
  }

  // Prefer an in-app path for next; ignore absolute external URLs for safety.
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  return redirectAfterAuth(supabase, origin, { next: safeNext });
}
