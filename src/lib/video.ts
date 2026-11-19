export type VideoSource = "YOUTUBE" | "VIMEO" | "UPLOAD";

/** Extract the 11-character YouTube id from any common URL format. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return clean(u.pathname.slice(1));
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.searchParams.get("v")) return clean(u.searchParams.get("v")!);
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
      if (m) return clean(m[2]);
    }
  } catch {
    /* not a URL */
  }
  return null;
  function clean(id: string) {
    return /^[\w-]{6,20}$/.test(id) ? id : null;
  }
}

export function vimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)vimeo\.com$/.test(u.hostname)) return null;
    const m = u.pathname.match(/(\d{6,12})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** Detect YouTube / Vimeo from a pasted link. */
export function detectSource(url: string): VideoSource | null {
  if (youtubeId(url)) return "YOUTUBE";
  if (vimeoId(url)) return "VIMEO";
  return null;
}

export function embedUrl(source: string, url: string): string | null {
  if (source === "YOUTUBE") {
    const id = youtubeId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
  }
  if (source === "VIMEO") {
    const id = vimeoId(url);
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` : null;
  }
  return null;
}

export function videoThumbnail(source: string, url: string, custom?: string): string | null {
  if (custom) return custom;
  if (source === "YOUTUBE") {
    const id = youtubeId(url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  }
  return null;
}
