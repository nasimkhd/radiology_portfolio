"use client";

import { useMemo, useState } from "react";
import { Search, Info, LayoutGrid } from "lucide-react";
import { VideoCard } from "@/components/video-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CatalogVideo } from "@/lib/types";

interface CategoryOption {
  name: string;
  slug: string;
  count: number;
}

export function MemberCatalog({
  videos,
  categories,
}: {
  videos: CatalogVideo[];
  categories: CategoryOption[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      const matchesCategory =
        activeCategory === "all" || v.categorySlug === activeCategory;
      const matchesQuery =
        q.length === 0 ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [videos, query, activeCategory]);

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos…"
            className="pl-9"
            aria-label="Search videos"
          />
        </div>

        <nav className="space-y-1">
          <CategoryButton
            label="All"
            count={videos.length}
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            icon={<LayoutGrid className="size-4" />}
          />
          {categories.map((cat) => (
            <CategoryButton
              key={cat.slug}
              label={cat.name}
              count={cat.count}
              active={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
            />
          ))}
        </nav>

        <div className="flex gap-2.5 rounded-xl border border-primary/20 bg-accent/50 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-navy">
              Watch videos on the site
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Lessons play inline after a quick access check. You can also open
              them on YouTube.
            </p>
          </div>
        </div>
      </aside>

      {/* Grid */}
      <div>
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No videos match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryButton({
  label,
  count,
  active,
  onClick,
  icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground/80 hover:bg-secondary"
      )}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          active ? "bg-primary-foreground/20" : "bg-secondary text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}
