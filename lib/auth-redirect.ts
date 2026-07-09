import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * After a successful email confirmation / OTP verify, send the user to the
 * right next page based on membership status.
 */
export async function redirectAfterAuth(
  supabase: SupabaseServerClient,
  origin: string,
  options?: { next?: string | null; user?: User | null }
): Promise<NextResponse> {
  if (options?.next) {
    const next = options.next.startsWith("/")
      ? options.next
      : new URL(options.next, origin).pathname +
        new URL(options.next, origin).search;
    return NextResponse.redirect(`${origin}${next}`);
  }

  const user =
    options?.user ??
    (
      await supabase.auth.getUser()
    ).data.user;

  if (!user) {
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_status, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.membership_status === "pending") {
    return NextResponse.redirect(`${origin}/pending-approval`);
  }
  if (profile.membership_status === "rejected") {
    return NextResponse.redirect(`${origin}/pending-approval?status=rejected`);
  }

  return NextResponse.redirect(`${origin}/dashboard/videos`);
}
