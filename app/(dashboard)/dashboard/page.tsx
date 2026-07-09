import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle, Sparkles, LayoutGrid, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { VideoCard } from "@/components/video-card";
import { getViewerContext } from "@/lib/auth";
import { getPublishedCatalog, categoriesFromCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { profile } = await getViewerContext();
  const catalog = await getPublishedCatalog(true);
  const categories = categoriesFromCatalog(catalog);
  const recent = catalog.slice(0, 3);

  const firstName = profile?.fName ?? "there";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your full radiology video library is ready.
          </p>
        </div>
        <Badge variant="members" className="mt-1">
          <CircleCheck className="size-3.5" />
          Approved Member
        </Badge>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickCard
          href="/dashboard/videos"
          icon={<LayoutGrid className="size-5" />}
          title="Full video library"
          body={`${catalog.length} lessons across ${categories.length} categories`}
        />
        <QuickCard
          href="/dashboard/videos"
          icon={<Sparkles className="size-5" />}
          title="Recently added"
          body="Catch up on the newest lessons"
        />
        <QuickCard
          href="/videos"
          icon={<PlayCircle className="size-5" />}
          title="Public previews"
          body="See what visitors can watch"
        />
      </div>

      {/* Recently added */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Recently added</h2>
          <Link
            href="/dashboard/videos"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View all
          </Link>
        </div>
        {recent.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No videos yet. Once the catalog is seeded, your lessons appear here.
          </p>
        )}
      </section>
    </div>
  );
}

function QuickCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full p-5 transition-shadow hover:shadow-md">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <h3 className="mt-3 font-semibold text-navy">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </Card>
    </Link>
  );
}
