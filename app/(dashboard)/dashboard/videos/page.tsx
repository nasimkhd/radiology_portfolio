import type { Metadata } from "next";
import { MemberCatalog } from "@/components/member-catalog";
import { getPublishedCatalog, categoriesFromCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Member Video Library",
};

export default async function MemberVideosPage() {
  const catalog = await getPublishedCatalog(true);
  const categories = categoriesFromCatalog(catalog);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Member Video Library
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse the full curated radiology catalog.
        </p>
      </header>

      <MemberCatalog videos={catalog} categories={categories} />
    </div>
  );
}
