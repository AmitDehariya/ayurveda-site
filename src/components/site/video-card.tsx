"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { SmartImage } from "./smart-image";
import { embedUrl, videoThumbnail } from "@/lib/video";

type V = { id: string; title: string; description: string; source: string; url: string; thumbnailUrl: string; category?: { name: string } | null };

/**
 * "Lite" embed: shows a thumbnail and only loads the heavy YouTube/Vimeo iframe
 * after a click. Keeps pages fast (good Lighthouse score) and privacy friendly.
 */
export function VideoCard({ video, compact }: { video: V; compact?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const embed = embedUrl(video.source, video.url);
  const thumb = videoThumbnail(video.source, video.url, video.thumbnailUrl);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="relative aspect-video bg-forest-950">
        {video.source === "UPLOAD" ? (
          <video controls preload="metadata" poster={video.thumbnailUrl || undefined} className="h-full w-full" aria-label={video.title}>
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : playing && embed ? (
          <iframe
            src={embed}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play video: ${video.title}`}>
            <SmartImage src={thumb} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-90 transition group-hover:opacity-100" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-400 text-forest-950 shadow-glow transition group-hover:scale-110">
                <Play className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex-1 p-5">
        {video.category ? <p className="eyebrow mb-2">{video.category.name}</p> : null}
        <h3 className="font-serif text-lg leading-snug text-forest-900">{video.title}</h3>
        {!compact && video.description ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{video.description}</p> : null}
      </div>
    </article>
  );
}
