import "server-only";

/**
 * Verify a Google reCAPTCHA v3 token. Disabled (always passes) when
 * RECAPTCHA_SECRET_KEY is not set – honeypot + rate limiting still apply.
 */
export async function verifyRecaptcha(token: string | undefined, action: string, ip: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, ...(ip !== "unknown" ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success: boolean; score?: number; action?: string };
    const min = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);
    return data.success && (data.score ?? 0) >= min && (!data.action || data.action === action);
  } catch (e) {
    // If Google is unreachable, don't block real visitors – other protections remain.
    console.warn("[recaptcha] verification error:", (e as Error).message);
    return true;
  }
}
