"use client";

import Image, { type StaticImageData } from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft, FolderOpen, Info, Search } from "lucide-react";
import { VideoCard } from "@/components/video-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import basicsThumbnail from "@/docs/Basics _of_radiology.png";
import abdominalThumbnail from "@/docs/abdominal_radiology.png";
import breastThumbnail from "@/docs/breast_imaging.png";
import cardiothoracicThumbnail from "@/docs/cardiothoracic_imaging.png";
import interventionalThumbnail from "@/docs/interventional_radiology.png";
import musculoskeletalThumbnail from "@/docs/musculoskletal_radiology.png";
import neuroradiologyThumbnail from "@/docs/neuroradiology.png";
import pediatricThumbnail from "@/docs/pediatric_radiology.png";
import type { CatalogCategory, CatalogVideo } from "@/lib/types";

const categoryThumbnails: Record<string, StaticImageData> = {
  basics: basicsThumbnail,
  "abdominal-radiology": abdominalThumbnail,
  "breast-imaging": breastThumbnail,
  cardiothoracic: cardiothoracicThumbnail,
  "interventional-radiology": interventionalThumbnail,
  musculoskeletal: musculoskeletalThumbnail,
  neuroradiology: neuroradiologyThumbnail,
  "pediatric-radiology": pediatricThumbnail,
};

export function MemberCatalog({
  videos,
  categories,
}: {
  videos: CatalogVideo[];
  categories: CatalogCategory[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const videosByCategory = useMemo(() => {
    const map = new Map<string, CatalogVideo[]>();
    for (const video of videos) {
      if (!video.categorySlug) continue;
      const categoryVideos = map.get(video.categorySlug) ?? [];
      categoryVideos.push(video);
      map.set(video.categorySlug, categoryVideos);
    }
    return map;
  }, [videos]);

  const visibleCategories = useMemo(() => {
    if (!normalizedQuery) return categories;

    return categories.filter((category) => {
      const categoryVideos = videosByCategory.get(category.slug) ?? [];
      return (
        category.name.toLowerCase().includes(normalizedQuery) ||
        category.description?.toLowerCase().includes(normalizedQuery) ||
        categoryVideos.some((video) => videoMatchesQuery(video, normalizedQuery))
      );
    });
  }, [categories, normalizedQuery, videosByCategory]);

  const activeCategoryDetails = useMemo(
    () => categories.find((category) => category.slug === activeCategory) ?? null,
    [categories, activeCategory]
  );

  const filteredVideos = useMemo(() => {
    if (!activeCategory) return [];
    const categoryVideos = videosByCategory.get(activeCategory) ?? [];
    if (!normalizedQuery) return categoryVideos;

    return categoryVideos.filter((video) =>
      videoMatchesQuery(video, normalizedQuery)
    );
  }, [activeCategory, normalizedQuery, videosByCategory]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeCategoryDetails
                ? `Search ${activeCategoryDetails.name} videos...`
                : "Search categories or videos..."
            }
            className="pl-9"
            aria-label="Search videos"
          />
        </div>
      </div>

      {activeCategoryDetails ? (
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-navy"
              >
                <ArrowLeft className="size-4" />
                Back to folders
              </button>
              <h2 className="text-2xl font-bold tracking-tight text-navy">
                {activeCategoryDetails.name}
              </h2>
              {activeCategoryDetails.description && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {activeCategoryDetails.description}
                </p>
              )}
            </div>

            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-muted-foreground">
              {activeCategoryDetails.count}{" "}
              {activeCategoryDetails.count === 1 ? "video" : "videos"}
            </span>
          </div>

          {filteredVideos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState>
              No videos match your current search in this folder.
            </EmptyState>
          )}
        </section>
      ) : visibleCategories.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCategories.map((category) => (
            <CategoryFolder
              key={category.slug}
              category={category}
              thumbnail={categoryThumbnails[category.slug]}
              onOpen={() => setActiveCategory(category.slug)}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No category folders match your current search.</EmptyState>
      )}
    </div>
  );
}

function CategoryFolder({
  category,
  thumbnail,
  onOpen,
}: {
  category: CatalogCategory;
  thumbnail?: StaticImageData;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-card text-left transition",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-navy">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-navy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
        <div className="absolute bottom-4 left-4 flex size-12 items-center justify-center rounded-xl bg-card/90 text-primary shadow">
          <FolderOpen className="size-6" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug text-navy">
            {category.name}
          </h3>
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {category.count}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {category.description ?? "Open this folder to view the videos."}
        </p>

        <p className="mt-4 text-sm font-semibold text-primary">
          Open folder
        </p>
      </div>
    </button>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function videoMatchesQuery(video: CatalogVideo, query: string) {
  return (
    video.title.toLowerCase().includes(query) ||
    video.description.toLowerCase().includes(query)
  );
}
