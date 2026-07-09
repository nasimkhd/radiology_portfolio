import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { VideoTable, type AdminVideoRow } from "@/components/admin/video-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Category, Video } from "@/lib/types";

export const metadata: Metadata = { title: "Manage Videos" };

type NameOnly = Pick<Category, "name">;
type Row = Pick<
  Video,
  "id" | "title" | "slug" | "access_level" | "status" | "display_order"
> & { categories: NameOnly | NameOnly[] | null };

function categoryName(categories: Row["categories"]): string | null {
  if (!categories) return null;
  return Array.isArray(categories)
    ? (categories[0]?.name ?? null)
    : categories.name;
}

async function getVideos(): Promise<AdminVideoRow[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("videos")
    .select("id, title, slug, access_level, status, display_order, categories(name)")
    .order("display_order", { ascending: true });

  return (((data ?? []) as unknown) as Row[]).map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    category: categoryName(v.categories),
    access_level: v.access_level,
    status: v.status,
    display_order: v.display_order,
  }));
}

export default async function AdminVideosPage() {
  const videos = await getVideos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Manage Videos
          </h1>
          <p className="mt-1 text-muted-foreground">
            {videos.length} videos. Draft and archived videos never appear in
            public or member catalogs.
          </p>
        </div>
        <Link href="/admin/videos/new" className={buttonVariants()}>
          <Plus className="size-4" />
          New video
        </Link>
      </div>

      <div className="mt-8">
        <VideoTable videos={videos} />
      </div>
    </div>
  );
}
