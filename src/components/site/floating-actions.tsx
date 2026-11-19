"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { WhatsappIcon } from "./icons";
import { digitsOnly } from "@/lib/utils";

/** WhatsApp floating button (if a number is configured) + back-to-top button. */
export function FloatingActions({ whatsappNumber, siteName }: { whatsappNumber: string; siteName: string }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = digitsOnly(whatsappNumber);
  const text = encodeURIComponent(`Namaste, I found ${siteName} online and would like to know more.`);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid h-11 w-11 place-items-center rounded-full border border-forest-700/20 bg-cream-50 text-forest-800 shadow-soft transition hover:bg-white"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
      {wa ? (
        <a
          href={`https://wa.me/${wa}?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25 group-hover:hidden" aria-hidden="true" />
          <WhatsappIcon className="relative h-7 w-7" />
        </a>
      ) : null}
    </div>
  );
}
