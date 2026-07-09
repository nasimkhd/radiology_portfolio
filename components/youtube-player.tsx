import { getYouTubeEmbedUrl } from "@/lib/youtube";

export function YouTubePlayer({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-navy shadow-sm">
      <iframe
        src={getYouTubeEmbedUrl(videoId)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
