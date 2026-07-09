import Image from "next/image";
import Link from "next/link";
import {
  PlayCircle,
  Lock,
  Users,
  ShieldCheck,
  GraduationCap,
  Link2,
  Eye,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/video-card";
import { getPublicPreviewVideos, getPublishedCatalog } from "@/lib/catalog";
import { getViewerContext } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [previews, fullCatalog, viewer] = await Promise.all([
    getPublicPreviewVideos(),
    getPublishedCatalog(false),
    getViewerContext(),
  ]);

  const memberCount = fullCatalog.filter(
    (v) => v.accessLevel === "members"
  ).length;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/60 to-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <Badge variant="preview" className="mb-5 px-3 py-1">
              <Users className="size-3.5" />
              Trusted education for medical learners
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl">
              Radiology Video Lessons for Medical Learners
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Explore selected public preview videos. Full access to
              our complete radiology video library is reserved for verified
              medical members.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/videos"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                <PlayCircle className="size-5" />
                Browse Preview Videos
              </Link>
              {!viewer.isApprovedMember && (
                <Link
                  href="/sign-up"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  <Lock className="size-5" />
                  Request Member Access
                </Link>
              )}
            </div>
          </div>

          {/* Hero visual */}
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black">
              <Image
                src="/chest-radiology.jpeg"
                alt="Chest radiograph"
                width={570}
                height={320}
                priority
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute left-3 top-3">
                <Badge variant="preview" className="bg-card/90 backdrop-blur">
                  <Eye className="size-3" />
                  Preview
                </Badge>
              </div>
              <div className="absolute right-3 top-3">
                <Badge variant="members" className="bg-navy/80 text-white backdrop-blur">
                  <Lock className="size-3" />
                  Members Library
                </Badge>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Users className="size-4" />
                  </span>
                  <span className="text-2xl font-bold text-navy">
                    {previews.length || 3}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-navy">
                  public previews
                </p>
                <p className="text-xs text-muted-foreground">Free to watch</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Lock className="size-4" />
                  </span>
                  <span className="text-sm font-bold text-navy">Full catalog</span>
                </div>
                <p className="mt-1 text-sm font-medium text-navy">
                  for verified members
                </p>
                <p className="text-xs text-muted-foreground">
                  {memberCount > 0 ? `${memberCount}+ lessons` : "Growing library"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public preview videos */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-navy">
            Public Preview Videos
          </h2>
          <p className="mt-2 text-muted-foreground">
            Watch these free preview lessons on the site.
          </p>
        </div>

        {previews.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Preview videos will appear here once the catalog is connected and
            seeded in Supabase.
          </p>
        )}
      </section>

      {/* Why join */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              Why request member access?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Membership is for verified medical and medical-adjacent learners.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              icon={<GraduationCap className="size-5" />}
              title="Full curated video catalog"
              body="Access the entire library of radiology lessons and cases across every subspecialty."
            />
            <Feature
              icon={<ShieldCheck className="size-5" />}
              title="Verified medical community"
              body="Access is limited to hospital, university, and health-system email addresses reviewed by an admin."
            />
            <Feature
              icon={<Link2 className="size-5" />}
              title="Watch after login"
              body="Member-only lessons play on the site after an access check. You can also open them on YouTube."
            />
          </div>

          {!viewer.user && (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-accent/40 p-8 text-center">
              <h3 className="text-lg font-semibold text-navy">
                Have a medical institution email?
              </h3>
              <p className="max-w-xl text-sm text-muted-foreground">
                Use your hospital, university, medical school, or health-system
                email address to request access. Personal email addresses such
                as Gmail, Yahoo, Outlook, and iCloud are not eligible.
              </p>
              <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
                Request Member Access
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="mt-4 font-semibold text-navy">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
