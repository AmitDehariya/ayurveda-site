"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { ZoomIn } from "lucide-react";
import { SmartImage } from "./smart-image";

type Photo = { id: string; url: string; caption: string; alt: string };

/** Masonry-style photo grid with an accessible lightbox (keyboard + swipe). */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(-1);
  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden rounded-2xl border bg-white shadow-sm"
              aria-label={`Open photo: ${p.caption || p.alt || `photo ${i + 1}`}`}
            >
              <SmartImage src={p.url} alt={p.alt || p.caption} width={800} height={600} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="h-auto w-full transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 grid place-items-center bg-forest-950/0 opacity-0 transition group-hover:bg-forest-950/30 group-hover:opacity-100">
                <ZoomIn className="h-8 w-8 text-white" aria-hidden="true" />
              </span>
              {p.caption ? <span className="block px-4 py-3 text-left text-sm text-forest-800">{p.caption}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Captions]}
        slides={photos.map((p) => ({ src: p.url, alt: p.alt || p.caption, description: p.caption }))}
      />
    </>
  );
}
