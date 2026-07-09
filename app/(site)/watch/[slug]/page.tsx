import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { YouTubePlayer } from "@/components/youtube-player";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getViewerContext } from "@/lib/auth";
import { getPublishedVideoMetadata, requireWatchableVideo } from "@/lib/watch-video";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await getPublishedVideoMetadata(slug);

  if (!video) {
    return { title: "Video" };
  }

  return {
    title: video.title,
    description: video.description,
  };
}

export default async function WatchPage({ params }: PageProps) {
  const { slug } = await params;
  const [video, viewer] = await Promise.all([
    requireWatchableVideo(slug),
    getViewerContext(),
  ]);

  const backHref = viewer.isApprovedMember ? "/dashboard/videos" : "/videos";
  const backLabel = viewer.isApprovedMember ? "Member library" : "Video library";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href={backHref}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-6 -ml-2 text-muted-foreground hover:text-navy"
        )}
      >
        <ArrowLeft className="size-4" />
        Back to {backLabel}
      </Link>

      <div className="space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {video.category && (
              <Badge variant="category">{video.category}</Badge>
            )}
            <Badge variant={video.accessLevel === "public" ? "preview" : "members"}>
              {video.accessLevel === "public" ? "Preview" : "Members"}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            {video.title}
          </h1>
        </header>

        <YouTubePlayer videoId={video.youtubeVideoId} title={video.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {video.description}
          </p>
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0"
            )}
          >
            <ExternalLink className="size-4" />
            Open on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
