import Link from "next/link";
import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { MemberCatalog } from "@/components/member-catalog";
import { buttonVariants } from "@/components/ui/button";
import { getCatalogCategories, getPublishedCatalog } from "@/lib/catalog";
import { getViewerContext } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Browse public radiology preview lessons and see what the full member library offers.",
};

export default async function VideosPage() {
  const viewer = await getViewerContext();
  const catalog = await getPublishedCatalog(viewer.isApprovedMember);
  const members = catalog.filter((v) => v.accessLevel === "members");
  const categories = await getCatalogCategories(catalog);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Video Library
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {viewer.isApprovedMember
            ? "You have full access to the curated radiology catalog. Every lesson plays right here after a quick access check."
            : "Selected preview lessons are free to watch on the site. The full library is available to verified medical members."}
        </p>
      </header>

      <section className="mb-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">
            Browse by category
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
      </section>

      <MemberCatalog videos={catalog} categories={categories} />
    </div>
  );
}
