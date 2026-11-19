import sanitizeHtml from "sanitize-html";

/**
 * Whitelist for rich text produced by the TipTap editor.
 * Applied when content is SAVED and again when it is RENDERED (defence in depth),
 * so even content inserted directly into the database can't run scripts.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a",
    "ul", "ol", "li", "blockquote", "code", "pre", "img", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  // Allow site-relative image paths such as /uploads/... and /placeholders/...
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "#";
      const external = /^https?:\/\//i.test(href);
      const out: sanitizeHtml.Attributes = external
        ? { href, target: "_blank", rel: "noopener noreferrer nofollow" }
        : { href };
      return { tagName, attribs: out };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
  allowedSchemesAppliedToAttributes: ["href", "src"],
};

export function sanitizeRichText(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, OPTIONS);
}

/** Strip every tag – for plain-text fields. */
export function stripAllTags(dirty: string): string {
  return sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} }).trim();
}
