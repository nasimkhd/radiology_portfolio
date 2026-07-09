import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveThumbnail } from "@/lib/youtube";
import type { CatalogVideo, Category, Video } from "@/lib/types";

type JoinedCategory = Pick<Category, "name" | "slug">;
type VideoWithCategory = Video & {
  categories: JoinedCategory | JoinedCategory[] | null;
};

/** Supabase infers embedded relations as arrays; normalize to a single row. */
function firstCategory(
  categories: JoinedCategory | JoinedCategory[] | null
): JoinedCategory | null {
  if (!categories) return null;
  return Array.isArray(categories) ? (categories[0] ?? null) : categories;
}

/**
 * Map a raw video row to the safe, browser-facing shape.
 * `youtube_url` is NEVER included. `watchPath` is only set for videos the
 * current viewer is allowed to open.
 */
function toCatalogVideo(row: VideoWithCategory, approved: boolean): CatalogVideo {
  const locked = row.access_level === "members" && !approved;
  const category = firstCategory(row.categories);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    thumbnailUrl: resolveThumbnail(row.thumbnail_url, row.youtube_video_id),
    accessLevel: row.access_level,
    category: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    locked,
    watchPath: locked ? null : `/watch/${row.slug}`,
  };
}

/**
 * Return the published catalog assembled server-side. Uses the service-role
 * client so it can read member-only rows and strip sensitive fields, rather
 * than exposing them to an anonymous browser client.
 *
 * @param approved whether the current viewer is an approved, verified member.
 */
export async function getPublishedCatalog(
  approved: boolean
): Promise<CatalogVideo[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    // Supabase not configured yet (local setup). Render empty states.
    return [];
  }

  const { data, error } = await supabase
    .from("videos")
    .select("*, categories(name, slug)")
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (error || !data) return [];

  return (data as VideoWithCategory[]).map((row) =>
    toCatalogVideo(row, approved)
  );
}

/** Public preview videos only (access_level = public, published). */
export async function getPublicPreviewVideos(): Promise<CatalogVideo[]> {
  const catalog = await getPublishedCatalog(false);
  return catalog.filter((v) => v.accessLevel === "public");
}

/** Distinct categories present in the published catalog, with counts. */
export function categoriesFromCatalog(
  videos: CatalogVideo[]
): { name: string; slug: string; count: number }[] {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const v of videos) {
    if (!v.categorySlug || !v.category) continue;
    const existing = map.get(v.categorySlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(v.categorySlug, {
        name: v.category,
        slug: v.categorySlug,
        count: 1,
      });
    }
  }
  return Array.from(map.values());
}
