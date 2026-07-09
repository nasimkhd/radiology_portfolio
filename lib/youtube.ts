/** YouTube URL parsing and thumbnail helpers. */

/** True when a URL looks like a valid YouTube destination. */
export function isValidYouTubeUrl(url: string): boolean {
  return (
    url.startsWith("https://www.youtube.com/") ||
    url.startsWith("https://youtube.com/") ||
    url.startsWith("https://m.youtube.com/") ||
    url.startsWith("https://youtu.be/")
  );
}

/** Extract the 11-character YouTube video ID from a URL, if present. */
export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (host.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      // /embed/{id}, /shorts/{id}, /live/{id}
      if (["embed", "shorts", "live", "v"].includes(parts[0])) {
        return parts[1] ?? null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Resolve the best thumbnail source for a video following the doc priority:
 * 1. custom thumbnail_url, 2. YouTube-generated from video id, 3. local placeholder.
 */
export function resolveThumbnail(
  thumbnailUrl: string | null | undefined,
  youtubeVideoId: string | null | undefined
): string {
  if (thumbnailUrl) return thumbnailUrl;
  if (youtubeVideoId && !youtubeVideoId.startsWith("REPLACE_ME")) {
    return `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  }
  return "/placeholder-thumbnail.svg";
}
