"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Thumbnail with graceful fallback: YouTube-generated images may 404 (e.g.
 * maxresdefault) or point at placeholder IDs, so fall back to the local SVG.
 */
export function VideoThumbnail({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [errored, setErrored] = useState(false);
  const resolved = errored ? "/placeholder-thumbnail.svg" : src;

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover"
      onError={() => setErrored(true)}
    />
  );
}
