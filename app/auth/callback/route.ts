import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirectAfterAuth } from "@/lib/auth-redirect";

/**
 * Handles Supabase redirects that still use the PKCE `code` flow
 * (e.g. OAuth, or older ConfirmationURL redirects).
 *
 * Prefer /auth/confirm + token_hash for email templates so links stay on
 * radiofromscratch.ca and avoid supabase.co URL mismatch / spam filters.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const explicitNext = searchParams.get("next");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback code exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/sign-in?error=verification`);
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      console.error("Auth callback verifyOtp failed:", error.message);
      return NextResponse.redirect(`${origin}/sign-in?error=verification`);
    }
  } else {
    return NextResponse.redirect(`${origin}/sign-in?error=verification`);
  }

  const safeNext =
    explicitNext &&
    explicitNext.startsWith("/") &&
    !explicitNext.startsWith("//")
      ? explicitNext
      : null;

  return redirectAfterAuth(supabase, origin, { next: safeNext });
}
