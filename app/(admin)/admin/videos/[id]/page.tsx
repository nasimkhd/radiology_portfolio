import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VideoForm } from "@/components/admin/video-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Category, Video } from "@/lib/types";

export const metadata: Metadata = { title: "Edit Video" };

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured) notFound();
  const supabase = createAdminClient();

  const [{ data: video }, { data: categories }] = await Promise.all([
    supabase.from("videos").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("categories")
      .select("id, name")
      .order("display_order", { ascending: true }),
  ]);

  if (!video) notFound();
  const typedVideo = video as Video;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <Link
        href="/admin/videos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to videos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Edit video
        </h1>
        <a
          href={typedVideo.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="size-4" />
          Open on YouTube
        </a>
      </div>

      <Card className="mt-6 p-6">
        <VideoForm
          categories={(categories as Pick<Category, "id" | "name">[]) ?? []}
          video={typedVideo}
        />
      </Card>
    </div>
  );
}
