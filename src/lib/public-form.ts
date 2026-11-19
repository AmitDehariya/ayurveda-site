import "server-only";
import { NextResponse } from "next/server";
import { getClientIp, hashIp, rateLimit } from "./rate-limit";
import { verifyRecaptcha } from "./recaptcha";

/**
 * Shared spam checks for public forms (contact, feedback):
 *  1. same-origin check (blocks forms posted from other websites)
 *  2. per-IP rate limit
 *  3. honeypot field ("website") – bots fill it, humans never see it
 *  4. optional reCAPTCHA v3
 * Returns a Response to send immediately, or null to continue.
 */
export async function guardPublicForm(
  req: Request,
  opts: { key: string; limit: number; windowMs: number; honeypot?: string; recaptchaToken?: string; action: string },
): Promise<{ response: NextResponse | null; ipHash: string }> {
  const ip = getClientIp(req.headers);
  const ipHash = hashIp(ip);

  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let crossSite = false;
  if (origin && host) {
    try {
      crossSite = new URL(origin).host !== host;
    } catch {
      crossSite = true; // e.g. "Origin: null" from sandboxed frames
    }
  }
  if (crossSite) {
    return { response: NextResponse.json({ error: "Request blocked" }, { status: 403 }), ipHash };
  }

  const rl = rateLimit(`${opts.key}:${ip}`, opts.limit, opts.windowMs);
  if (!rl.ok) {
    return {
      response: NextResponse.json(
        { error: `Too many submissions. Please try again in ${Math.ceil(rl.retryAfter / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      ),
      ipHash,
    };
  }

  // Pretend success so bots don't learn they were caught.
  if (opts.honeypot) return { response: NextResponse.json({ ok: true }), ipHash };

  if (!(await verifyRecaptcha(opts.recaptchaToken, opts.action, ip))) {
    return { response: NextResponse.json({ error: "Spam check failed. Please refresh the page and try again." }, { status: 400 }), ipHash };
  }
  return { response: null, ipHash };
}
