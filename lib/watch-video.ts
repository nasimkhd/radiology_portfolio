import "server-only";

import { notFound, redirect } from "next/navigation";
import { getViewerContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";
import type { Category, Video } from "@/lib/types";

type JoinedCategory = Pick<Category, "name">;
type VideoRow = Pick<
  Video,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "youtube_url"
  | "youtube_video_id"
  | "access_level"
  | "status"
> & {
  categories: JoinedCategory | JoinedCategory[] | null;
};

export interface WatchableVideo {
  id: string;
  title: string;
  slug: string;
  description: string;
  youtubeVideoId: string;
  youtubeUrl: string;
  accessLevel: Video["access_level"];
  category: string | null;
}

function firstCategory(
  categories: JoinedCategory | JoinedCategory[] | null
): JoinedCategory | null {
  if (!categories) return null;
  return Array.isArray(categories) ? (categories[0] ?? null) : categories;
}

function toWatchableVideo(row: VideoRow): WatchableVideo | null {
  const youtubeVideoId =
    row.youtube_video_id && !row.youtube_video_id.startsWith("REPLACE_ME")
      ? row.youtube_video_id
      : extractYouTubeId(row.youtube_url);

  if (!youtubeVideoId) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    youtubeVideoId,
    youtubeUrl: row.youtube_url,
    accessLevel: row.access_level,
    category: firstCategory(row.categories)?.name ?? null,
  };
}

/**
 * Read published video metadata for SEO. Does not enforce member access.
 */
export async function getPublishedVideoMetadata(
  slug: string
): Promise<{ title: string; description: string } | null> {
  if (!isSupabaseConfigured) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("videos")
    .select("title, description, status")
    .eq("slug", slug)
    .maybeSingle<Pick<Video, "title" | "description" | "status">>();

  if (!data || data.status !== "published") return null;

  return { title: data.title, description: data.description };
}

/**
 * Load a published video for inline playback after verifying the viewer may
 * watch it. Redirects to sign-in or approval flows for locked content.
 */
export async function requireWatchableVideo(
  slug: string
): Promise<WatchableVideo> {
  if (!isSupabaseConfigured) {
    redirect("/videos");
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("videos")
    .select(
      "id, slug, title, description, youtube_url, youtube_video_id, access_level, status, categories(name)"
    )
    .eq("slug", slug)
    .maybeSingle<VideoRow>();

  if (!data || data.status !== "published") {
    notFound();
  }

  const watchable = toWatchableVideo(data);
  if (!watchable) {
    notFound();
  }

  if (data.access_level === "public") {
    return watchable;
  }

  const ctx = await getViewerContext();
  const nextParam = `/watch/${slug}`;

  if (!ctx.user) {
    redirect(`/sign-in?next=${encodeURIComponent(nextParam)}`);
  }
  if (!ctx.emailVerified) {
    redirect("/verify-email");
  }
  if (!ctx.profile || ctx.profile.membership_status === "pending") {
    redirect("/pending-approval");
  }
  if (ctx.profile.membership_status === "rejected") {
    redirect("/pending-approval?status=rejected");
  }

  const supabase = await createClient();
  await supabase.from("video_access_events").insert({
    profile_id: ctx.user.id,
    video_id: data.id,
    event_type: "redirect",
  });

  return watchable;
}
