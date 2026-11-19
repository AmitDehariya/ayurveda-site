import { createHash } from "node:crypto";

/**
 * Small in-memory sliding-window rate limiter.
 *
 * Good enough for a single server / a low-traffic site. On serverless
 * platforms each instance has its own memory, so limits are per-instance;
 * for stricter limits swap this for a shared store such as Upstash Redis
 * (keep the same `rateLimit()` signature).
 */
type Bucket = { hits: number[] };
const store = new Map<string, Bucket>();
let lastSweep = Date.now();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  // Periodically drop stale keys so memory doesn't grow forever.
  if (now - lastSweep > 60_000) {
    for (const [k, b] of store) if (!b.hits.some((t) => now - t < windowMs * 2)) store.delete(k);
    lastSweep = now;
  }
  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    store.set(key, bucket);
    const retryAfter = Math.ceil((windowMs - (now - bucket.hits[0])) / 1000);
    return { ok: false as const, retryAfter };
  }
  bucket.hits.push(now);
  store.set(key, bucket);
  return { ok: true as const, remaining: limit - bucket.hits.length };
}

/** Check a limit without recording a hit (e.g. only failed logins should count). */
export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (store.get(key)?.hits ?? []).filter((t) => now - t < windowMs);
  return hits.length >= limit;
}

export function resetRateLimit(key: string) {
  store.delete(key);
}

/** Best-effort client IP from proxy headers (Vercel / Nginx set x-forwarded-for). */
export function getClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const get = (name: string) => {
    if (headers instanceof Headers) return headers.get(name);
    const v = headers[name];
    return Array.isArray(v) ? v[0] : v ?? null;
  };
  return (get("x-forwarded-for")?.split(",")[0] || get("x-real-ip") || "unknown").trim();
}

/** Store a hash instead of the raw IP (privacy) – still useful to spot repeat spam. */
export function hashIp(ip: string) {
  return createHash("sha256").update(`${ip}:${process.env.NEXTAUTH_SECRET ?? ""}`).digest("hex").slice(0, 32);
}
