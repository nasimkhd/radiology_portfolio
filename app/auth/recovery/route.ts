import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Password reset entry point. Handles both:
 * - Custom email template: /auth/recovery?token_hash=…
 * - Default Supabase redirect: /auth/recovery?code=…
 *
 * Reset Password email template (Supabase Dashboard):
 * {{ .SiteURL }}/auth/recovery?token_hash={{ .TokenHash }}
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");

  const supabase = await createClient();

  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash,
    });
    if (error) {
      console.error("Password recovery verifyOtp failed:", error.message);
      return NextResponse.redirect(
        `${origin}/sign-in?error=password_reset`
      );
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Password recovery code exchange failed:", error.message);
      return NextResponse.redirect(
        `${origin}/sign-in?error=password_reset`
      );
    }
  } else {
    return NextResponse.redirect(`${origin}/sign-in?error=password_reset`);
  }

  return NextResponse.redirect(`${origin}/update-password`);
}
