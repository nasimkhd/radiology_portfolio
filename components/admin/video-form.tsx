"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createVideo, updateVideo } from "@/app/(admin)/admin/actions";
import type { Category, Video } from "@/lib/types";

const selectClass =
  "flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none";

export function VideoForm({
  categories,
  video,
}: {
  categories: Pick<Category, "id" | "name">[];
  video?: Video;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setError(null);
    const result = video
      ? await updateVideo(video.id, formData)
      : await createVideo(formData);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save the video.");
      return;
    }
    router.push("/admin/videos");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={video?.title} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={video?.slug}
          placeholder="Leave blank to generate from title"
        />
        <p className="text-xs text-muted-foreground">
          Lowercase and URL-safe. Used in the watch link, e.g. /watch/your-slug.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={video?.description}
          className="w-full rounded-lg border border-input bg-card p-3 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="youtubeUrl">YouTube URL</Label>
        <Input
          id="youtubeUrl"
          name="youtubeUrl"
          required
          defaultValue={video?.youtube_url}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
          The video ID is extracted automatically for thumbnails and playback.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="thumbnailUrl">Custom thumbnail URL (optional)</Label>
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          defaultValue={video?.thumbnail_url ?? ""}
          placeholder="Leave blank to use the YouTube thumbnail"
        />
        <p className="text-xs text-muted-foreground">
          Must be a full image URL (https://…) if provided. Leave blank to use
          the YouTube thumbnail.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={video?.category_id ?? ""}
          className={selectClass}
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          id="newCategoryName"
          name="newCategoryName"
          placeholder="Or type a new category name"
        />
        <p className="text-xs text-muted-foreground">
          {categories.length === 0
            ? "No categories yet. Type a name above and save — it will show up in this dropdown next time."
            : "Pick an existing category, or type a new name to create one when you save."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="displayOrder">Display order</Label>
          <Input
            id="displayOrder"
            name="displayOrder"
            type="number"
            defaultValue={video?.display_order ?? 0}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accessLevel">Access level</Label>
          <select
            id="accessLevel"
            name="accessLevel"
            defaultValue={video?.access_level ?? "members"}
            className={selectClass}
          >
            <option value="public">Public (preview)</option>
            <option value="members">Members only</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={video?.status ?? "draft"}
          className={selectClass}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={busy}>
          <Save className="size-4" />
          {busy ? "Saving…" : video ? "Save changes" : "Create video"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/videos")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
