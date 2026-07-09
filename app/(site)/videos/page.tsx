import Link from "next/link";
import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { VideoCard } from "@/components/video-card";
import { getPublishedCatalog } from "@/lib/catalog";
import { getViewerContext } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Browse public radiology preview lessons and see what the full member library offers.",
};

export default async function VideosPage() {
  const viewer = await getViewerContext();
  const catalog = await getPublishedCatalog(viewer.isApprovedMember);

  const previews = catalog.filter((v) => v.accessLevel === "public");
  const members = catalog.filter((v) => v.accessLevel === "members");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Video Library
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {viewer.isApprovedMember
            ? "You have full access to the curated radiology catalog. Every lesson opens on YouTube after a quick access check."
            : "Selected preview lessons are free to watch. The full library is available to verified medical members."}
        </p>
      </header>

      {/* Public previews */}
      <section className="mb-14">
        <h2 className="mb-5 text-lg font-semibold text-navy">
          Public preview videos
        </h2>
        {previews.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* Members library */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">
            {viewer.isApprovedMember
              ? "Member library"
              : "Members-only library"}
          </h2>
          {!viewer.isApprovedMember && members.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="size-4" />
              Sign up to unlock {members.length} lessons
            </span>
          )}
        </div>

        {!viewer.isApprovedMember && (
          <div className="mb-6 rounded-xl border border-border bg-accent/40 p-5">
            <p className="text-sm leading-relaxed text-accent-foreground">
              Members-only lessons. Sign up with a hospital, university, or
              medical institution email to access the full library.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
                Request member access
              </Link>
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Sign in
              </Link>
            </div>
          </div>
        )}

        {members.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
      No videos to show yet. Once Supabase is connected and the catalog is
      seeded, videos will appear here.
    </p>
  );
}
