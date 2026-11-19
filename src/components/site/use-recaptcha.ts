"use client";

import { useCallback, useEffect } from "react";

declare global {
  interface Window {
    grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Loads reCAPTCHA v3 only when a site key is configured. Returns a token getter. */
export function useRecaptcha() {
  useEffect(() => {
    if (!SITE_KEY || document.getElementById("recaptcha-v3")) return;
    const s = document.createElement("script");
    s.id = "recaptcha-v3";
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  return useCallback(async (action: string): Promise<string | undefined> => {
    if (!SITE_KEY || !window.grecaptcha) return undefined;
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!.execute(SITE_KEY, { action }).then(resolve, () => resolve(undefined));
      });
    });
  }, []);
}
