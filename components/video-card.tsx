import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { VideoThumbnail } from "@/components/video-thumbnail";
import { cn } from "@/lib/utils";
import type { CatalogVideo } from "@/lib/types";

export function VideoCard({ video }: { video: CatalogVideo }) {
  const locked = video.locked;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-navy">
        <VideoThumbnail src={video.thumbnailUrl ?? ""} alt={video.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />

        <div className="absolute left-3 top-3">
          {video.category && (
            <Badge variant="category" className="bg-card/90 backdrop-blur">
              {video.category}
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3">
          {locked ? (
            <Badge variant="members" className="bg-card/90 backdrop-blur">
              <Lock className="size-3" />
              Members
            </Badge>
          ) : video.accessLevel === "members" ? (
            <Badge variant="members" className="bg-card/90 backdrop-blur">
              Members
            </Badge>
          ) : (
            <Badge variant="preview" className="bg-card/90 backdrop-blur">
              Preview
            </Badge>
          )}
        </div>

        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/45 backdrop-blur-[2px]">
            <span className="flex size-12 items-center justify-center rounded-full bg-card/90 text-navy shadow">
              <Lock className="size-5" />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug text-navy">{video.title}</h3>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
          {video.description}
        </p>

        <div className="pt-2">
          {locked ? (
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              <Lock className="size-4" />
              Sign up to unlock
            </Link>
          ) : (
            <Link
              href={video.watchPath ?? "#"}
              className={cn(buttonVariants({ variant: "primary" }), "w-full")}
            >
              <Play className="size-4" />
              Watch video
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
