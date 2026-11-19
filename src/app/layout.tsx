import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/settings";
import { shareImage } from "@/lib/utils";
import "./globals.css";

const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Poppins({
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#26402c",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.metaTitle || s.siteName;
  const description = s.metaDescription || s.heroSubtitle;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: title, template: `%s | ${s.siteName}` },
    description,
    keywords: s.metaKeywords ? s.metaKeywords.split(",").map((k) => k.trim()) : undefined,
    icons: { icon: s.faviconUrl || "/favicon.svg" },
    openGraph: {
      type: "website",
      siteName: s.siteName,
      title,
      description,
      locale: "en_IN",
      images: [shareImage(s.ogImageUrl, s.heroImageUrl)],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${devanagari.variable}`}>
      <body>
        {children}
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
