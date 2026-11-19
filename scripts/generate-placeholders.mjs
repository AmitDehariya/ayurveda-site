// Generates the neutral SVG placeholder artwork used by the seed data.
// Run with:  npm run placeholders
// Replace these from the admin panel with real photos.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "public", "placeholders");
mkdirSync(out, { recursive: true });

const palettes = [
  ["#2d4f34", "#6a9870", "#e4c477"],
  ["#5c4329", "#ad782f", "#efdcaa"],
  ["#1f3525", "#4a7c51", "#f3e9d3"],
  ["#386340", "#97ba9a", "#f8efd6"],
  ["#8b5a28", "#d8ac50", "#faf5ea"],
  ["#26402c", "#c9973a", "#e0ebe0"],
];

const leaf = (x, y, s, r, fill, op = 0.5) =>
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${op}"><path d="M0 0C30-40 80-50 120-30 100 10 50 30 0 0Z" fill="${fill}"/><path d="M0 0C40-12 80-22 120-30" stroke="${fill}" stroke-opacity=".6" stroke-width="3" fill="none"/></g>`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function scene({ w, h, label, sub = "Placeholder image – replace from admin", pal = palettes[0], icon = "" }) {
  const [dark, mid, light] = pal;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
<radialGradient id="r" cx=".75" cy=".2" r=".7"><stop offset="0" stop-color="${light}" stop-opacity=".45"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>
${leaf(w * 0.05, h * 0.9, w / 500, -30, light, 0.35)}${leaf(w * 0.8, h * 0.25, w / 700, 150, light, 0.3)}${leaf(w * 0.7, h * 0.95, w / 600, -60, light, 0.25)}
${icon}
<text x="50%" y="${h * 0.5 + (icon ? h * 0.16 : 0)}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(w / 18)}" fill="${light}">${esc(label)}</text>
<text x="50%" y="${h * 0.5 + (icon ? h * 0.16 : 0) + w / 22}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(w / 45)}" fill="${light}" fill-opacity=".75">${esc(sub)}</text>
</svg>`;
}

const mortar = (w, h, c) =>
  `<g transform="translate(${w / 2 - 60} ${h * 0.22})" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity=".85"><path d="M10 60h100c0 30-22 50-50 50S10 90 10 60Z"/><path d="M75 55l30-50"/><circle cx="60" cy="40" r="6" fill="${c}"/></g>`;

const files = {
  "doctor-portrait.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0ebe0"/><stop offset="1" stop-color="#97ba9a"/></linearGradient></defs>
<rect width="800" height="1000" fill="url(#g)"/>
${leaf(40, 950, 2.2, -40, "#2d4f34", 0.18)}${leaf(600, 200, 1.6, 160, "#2d4f34", 0.15)}
<circle cx="400" cy="380" r="150" fill="#2d4f34" fill-opacity=".55"/>
<path d="M130 1000c0-190 120-330 270-330s270 140 270 330Z" fill="#2d4f34" fill-opacity=".55"/>
<text x="400" y="960" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#1f3525" fill-opacity=".8">Doctor photo placeholder – upload from admin</text>
</svg>`,
  "about.svg": scene({ w: 1200, h: 900, label: "Clinic / College", pal: palettes[2] }),
  "service-panchakarma.svg": scene({ w: 1200, h: 800, label: "Panchakarma", pal: palettes[0], icon: mortar(1200, 800, "#e4c477") }),
  "service-diet.svg": scene({ w: 1200, h: 800, label: "Diet & Lifestyle", pal: palettes[3], icon: mortar(1200, 800, "#f8efd6") }),
  "service-women.svg": scene({ w: 1200, h: 800, label: "Women's Health", pal: palettes[1], icon: mortar(1200, 800, "#efdcaa") }),
  "blog-1.svg": scene({ w: 1200, h: 675, label: "Daily Routine (Dinacharya)", pal: palettes[5] }),
  "blog-2.svg": scene({ w: 1200, h: 675, label: "Seasonal Wellness (Ritucharya)", pal: palettes[4] }),
  "video-1.svg": scene({ w: 1280, h: 720, label: "Sample Video", sub: "Replace with a real YouTube link from admin", pal: palettes[0] }),
  "video-2.svg": scene({ w: 1280, h: 720, label: "Sample Lecture", sub: "Replace with a real YouTube link from admin", pal: palettes[2] }),
  "certificate.svg": scene({ w: 1000, h: 700, label: "Certificate", pal: palettes[1] }),
  "leaf-pattern.svg": scene({ w: 1200, h: 800, label: "Ayurveda", sub: "Image coming soon", pal: palettes[3] }),
  "og-default.svg": scene({ w: 1200, h: 630, label: "Ayurveda", sub: "Holistic healing", pal: palettes[0] }),
};

const galleryLabels = ["Lecture", "Seminar", "Health Camp", "Workshop", "Herbal Garden", "Event"];
galleryLabels.forEach((label, i) => {
  files[`gallery-${i + 1}.svg`] = scene({ w: 1200, h: i % 2 ? 1500 : 900, label, pal: palettes[i % palettes.length] });
});

for (const [name, svg] of Object.entries(files)) writeFileSync(join(out, name), svg);
console.log(`Wrote ${Object.keys(files).length} placeholders to public/placeholders`);
