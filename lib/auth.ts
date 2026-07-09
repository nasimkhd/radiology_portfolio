import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/lib/types";

export interface ViewerContext {
  user: User | null;
  profile: Profile | null;
  emailVerified: boolean;
  isApprovedMember: boolean;
  isAdmin: boolean;
}

/** Read the current Supabase auth user (or null). */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Load the current user's profile row (or null). */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

/**
 * Resolve everything a page or the header needs to make access decisions in a
 * single round trip.
 */
export async function getViewerContext(): Promise<ViewerContext> {
  const empty: ViewerContext = {
    user: null,
    profile: null,
    emailVerified: false,
    isApprovedMember: false,
    isAdmin: false,
  };

  if (!isSupabaseConfigured) return empty;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (data as Profile | null) ?? null;
  const emailVerified = Boolean(user.email_confirmed_at);
  const isApprovedMember =
    profile?.membership_status === "approved" && emailVerified;
  const isAdmin =
    profile?.role === "admin" &&
    profile?.membership_status === "approved" &&
    emailVerified;

  return { user, profile, emailVerified, isApprovedMember, isAdmin };
}

/**
 * Require an approved + email-verified member. Redirects to the appropriate
 * page otherwise. Returns the viewer context on success.
 */
export async function requireApprovedMember(
  next?: string
): Promise<ViewerContext> {
  const ctx = await getViewerContext();

  if (!ctx.user) {
    redirect(`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  // Email verification is the first gate; admin review comes after.
  if (!ctx.emailVerified) {
    redirect("/verify-email");
  }
  if (!ctx.profile || ctx.profile.membership_status === "pending") {
    redirect("/pending-approval");
  }
  if (ctx.profile.membership_status === "rejected") {
    redirect("/pending-approval?status=rejected");
  }

  return ctx;
}

/** Require an admin user. Redirects otherwise. Returns viewer context. */
export async function requireAdmin(): Promise<ViewerContext> {
  const ctx = await getViewerContext();

  if (!ctx.user) {
    redirect("/sign-in?next=/admin");
  }
  if (!ctx.isAdmin) {
    // Signed in but not an admin.
    redirect("/dashboard");
  }

  return ctx;
}
