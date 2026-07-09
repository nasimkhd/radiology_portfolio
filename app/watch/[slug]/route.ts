import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile, Video } from "@/lib/types";

/**
 * Access-checking YouTube redirect. This route centralizes authorization: the
 * final youtube_url is only revealed after confirming the viewer may open it.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { origin } = new URL(request.url);

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(`${origin}/videos`);
  }

  const admin = createAdminClient();
  const { data: video } = await admin
    .from("videos")
    .select("id, slug, youtube_url, access_level, status")
    .eq("slug", slug)
    .maybeSingle<Pick<Video, "id" | "slug" | "youtube_url" | "access_level" | "status">>();

  // Missing, draft, or archived → treat as not found.
  if (!video || video.status !== "published") {
    return new NextResponse("Video not found", { status: 404 });
  }

  // Public videos: anyone may open.
  if (video.access_level === "public") {
    return NextResponse.redirect(video.youtube_url);
  }

  // Member-only videos: verify session, approval, and email verification.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextParam = encodeURIComponent(`/watch/${slug}`);
  if (!user) {
    return NextResponse.redirect(`${origin}/sign-in?next=${nextParam}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_status")
    .eq("id", user.id)
    .maybeSingle<Pick<Profile, "membership_status">>();

  if (!user.email_confirmed_at) {
    return NextResponse.redirect(`${origin}/verify-email`);
  }
  if (!profile || profile.membership_status === "pending") {
    return NextResponse.redirect(`${origin}/pending-approval`);
  }
  if (profile.membership_status === "rejected") {
    return NextResponse.redirect(`${origin}/pending-approval?status=rejected`);
  }

  // Approved + verified. Record the access event (best effort) and redirect.
  await supabase.from("video_access_events").insert({
    profile_id: user.id,
    video_id: video.id,
    event_type: "redirect",
  });

  return NextResponse.redirect(video.youtube_url);
}
