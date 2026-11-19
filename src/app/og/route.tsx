import { ImageResponse } from "next/og";
import { getSettings, getProfile } from "@/lib/settings";

/**
 * Default social-sharing image (1200×630 PNG) generated from the site settings.
 * Used when the admin hasn't uploaded a custom sharing image. Social networks
 * don't display SVG, so this replaces the SVG placeholder artwork.
 */
export const revalidate = 3600;

export async function GET() {
  const [s, p] = await Promise.all([getSettings(), getProfile()]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1f3525 0%, #2d4f34 55%, #386340 100%)",
          color: "#faf5ea",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#e4c477" }}>
          {s.tagline || "Ayurveda"}
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>{s.siteName}</div>
        <div style={{ display: "flex", fontSize: 34, marginTop: 28, color: "#efdcaa", maxWidth: 950 }}>
          {[p.designation, p.title].filter(Boolean).join(" · ") || "Holistic Ayurvedic care"}
        </div>
        <div style={{ display: "flex", width: 160, height: 4, background: "#c9973a", marginTop: 48, borderRadius: 4 }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
