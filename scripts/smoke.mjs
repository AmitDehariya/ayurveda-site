// End-to-end smoke test against a running server.
//
//   npm run dev            (in one terminal)
//   npm run test:smoke     (in another)  – or:  BASE_URL=http://localhost:3100 node scripts/smoke.mjs
//
// Uses ADMIN_EMAIL / ADMIN_PASSWORD from .env. Creates and then deletes its own test data.
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    }),
);
const BASE = process.env.BASE_URL || "http://localhost:3000";
const ONLY = process.argv[2]; // optional section filter: pages | auth | admin | forms

let passed = 0;
let failed = 0;
const jar = new Map();

function check(name, cond, extra = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name} ${extra}`);
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function req(path, { method = "GET", body, json, headers = {}, auth = false, form } = {}) {
  const h = { ...headers };
  if (auth && jar.size) h.cookie = cookieHeader();
  let payload = body;
  if (json !== undefined) {
    h["content-type"] = "application/json";
    payload = JSON.stringify(json);
  }
  if (form) payload = form;
  const res = await fetch(BASE + path, { method, headers: h, body: payload, redirect: "manual" });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, text, headers: res.headers };
}

async function login(email, password) {
  jar.clear();
  const csrf = await req("/api/auth/csrf", { auth: true });
  const body = new URLSearchParams({ csrfToken: csrf.data.csrfToken, email, password, json: "true", callbackUrl: `${BASE}/admin` });
  const r = await req("/api/auth/callback/credentials", {
    method: "POST",
    body,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    auth: true,
  });
  return r;
}

const sections = {
  async pages() {
    console.log("\nPublic pages");
    const pages = ["/", "/about", "/services", "/blog", "/blog?q=routine", "/gallery", "/videos", "/feedback", "/contact", "/sitemap.xml", "/robots.txt"];
    for (const p of pages) {
      const r = await req(p);
      check(`${p} → 200`, r.status === 200, `(got ${r.status})`);
    }
    const nf = await req("/services/this-does-not-exist");
    check("unknown service → 404", nf.status === 404, `(got ${nf.status})`);
    const home = await req("/");
    check("home shows disclaimer", home.text.includes("not a substitute"));
    check("home has JSON-LD Physician", home.text.includes('"Physician"'));
  },

  async auth() {
    console.log("\nAuth & protection");
    jar.clear();
    const a = await req("/api/admin/services", { auth: true });
    check("admin API without login → 401", a.status === 401, `(got ${a.status})`);
    const p = await req("/admin");
    check("admin page without login → redirect to login", [302, 307].includes(p.status) && (p.headers.get("location") || "").includes("/admin/login"), `(got ${p.status})`);
    const bad = await login(env.ADMIN_EMAIL, "wrong-password-123");
    check("wrong password rejected", !String(bad.data?.url ?? "").endsWith("/admin") || String(bad.data?.url).includes("error"), JSON.stringify(bad.data));
    const good = await login(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
    check("correct password accepted", good.status === 200 && !String(good.data?.url ?? "").includes("error"), JSON.stringify(good.data));
    const s = await req("/api/auth/session", { auth: true });
    check("session has admin email", s.data?.user?.email === env.ADMIN_EMAIL.toLowerCase(), JSON.stringify(s.data));
    const dash = await req("/admin", { auth: true });
    check("dashboard loads when signed in", dash.status === 200 && dash.text.includes("Dashboard"), `(got ${dash.status})`);
    const csrf = await req("/api/admin/password", { method: "POST", json: {}, auth: true, headers: { origin: "https://evil.example" } });
    check("cross-site admin POST blocked", csrf.status === 403, `(got ${csrf.status})`);
  },

  async admin() {
    console.log("\nAdmin pages");
    for (const p of ["/admin", "/admin/inquiries", "/admin/feedback", "/admin/blog", "/admin/services", "/admin/gallery", "/admin/videos", "/admin/profile", "/admin/stats", "/admin/settings", "/admin/password"]) {
      const r = await req(p, { auth: true });
      check(`${p} → 200`, r.status === 200, `(got ${r.status})`);
    }

    console.log("\nServices CRUD");
    const bad = await req("/api/admin/services", { method: "POST", json: { title: "" }, auth: true });
    check("missing title → 422 with field error", bad.status === 422 && bad.data?.fields?.title, JSON.stringify(bad.data));
    const created = await req("/api/admin/services", {
      method: "POST", auth: true,
      json: { title: "Smoke Test Service", shortDescription: "temp", contentHtml: '<p>Hello</p><script>alert(1)</script><img src="x" onerror="alert(2)"><a href="javascript:alert(3)">x</a>' },
    });
    const svc = created.data?.item;
    check("create service → 201", created.status === 201 && svc?.id, JSON.stringify(created.data));
    check("slug auto-generated", svc?.slug === "smoke-test-service", svc?.slug);
    check("rich text sanitised (no script / onerror / javascript:)", svc && !/script|onerror|javascript:/i.test(svc.contentHtml), svc?.contentHtml);
    let pub = await req(`/services/${svc.slug}`);
    check("new service visible on website", pub.status === 200 && pub.text.includes("Smoke Test Service"), `(got ${pub.status})`);
    const dup = await req("/api/admin/services", { method: "POST", json: { title: "Smoke Test Service" }, auth: true });
    check("duplicate title gets unique slug", dup.data?.item?.slug === "smoke-test-service-2", dup.data?.item?.slug);
    const upd = await req(`/api/admin/services/${svc.id}`, { method: "PUT", auth: true, json: { ...svc, title: "Smoke Test Service Updated" } });
    check("update service", upd.status === 200 && upd.data.item.title === "Smoke Test Service Updated" && upd.data.item.slug === svc.slug);
    const hide = await req(`/api/admin/services/${svc.id}`, { method: "PATCH", auth: true, json: { isVisible: false } });
    check("hide service (PATCH)", hide.status === 200 && hide.data.item.isVisible === false);
    pub = await req(`/services/${svc.slug}`);
    check("hidden service → 404 on website", pub.status === 404, `(got ${pub.status})`);
    const badPatch = await req(`/api/admin/services/${svc.id}`, { method: "PATCH", auth: true, json: { title: "sneaky" } });
    check("PATCH rejects unexpected fields", badPatch.status === 422, `(got ${badPatch.status})`);
    const list = await req("/api/admin/services", { auth: true });
    const ids = list.data.items.map((i) => i.id);
    const reordered = [svc.id, ...ids.filter((i) => i !== svc.id)];
    const ro = await req("/api/admin/services/reorder", { method: "POST", auth: true, json: { ids: reordered } });
    const list2 = await req("/api/admin/services", { auth: true });
    check("reorder services", ro.status === 200 && list2.data.items[0].id === svc.id);
    await req("/api/admin/services/reorder", { method: "POST", auth: true, json: { ids } });
    for (const id of [svc.id, dup.data.item.id]) {
      const d = await req(`/api/admin/services/${id}`, { method: "DELETE", auth: true });
      check("delete service", d.status === 200);
    }
    const gone = await req(`/api/admin/services/${svc.id}`, { auth: true });
    check("deleted service → 404", gone.status === 404);
    const unknown = await req("/api/admin/hackers", { auth: true });
    check("unknown resource → 404", unknown.status === 404);

    console.log("\nArticles & categories");
    const cat = await req("/api/admin/categories", { method: "POST", auth: true, json: { name: "Smoke Cat", type: "BLOG" } });
    check("create category", cat.status === 201 && cat.data.item.slug === "smoke-cat");
    const post = await req("/api/admin/posts", { method: "POST", auth: true, json: { title: "Smoke Article", excerpt: "x", contentHtml: "<p>Body text</p>", status: "PUBLISHED", categoryId: cat.data.item.id, tags: "smoke, test" } });
    check("create published article", post.status === 201 && post.data.item.publishedAt, JSON.stringify(post.data));
    pub = await req(`/blog/${post.data.item.slug}`);
    check("article visible on website", pub.status === 200 && pub.text.includes("Smoke Article"));
    const draft = await req(`/api/admin/posts/${post.data.item.id}`, { method: "PATCH", auth: true, json: { status: "DRAFT" } });
    pub = await req(`/blog/${post.data.item.slug}`);
    check("draft article hidden from website", draft.status === 200 && pub.status === 404, `(got ${pub.status})`);
    await req(`/api/admin/posts/${post.data.item.id}`, { method: "DELETE", auth: true });
    await req(`/api/admin/categories/${cat.data.item.id}`, { method: "DELETE", auth: true });

    console.log("\nVideos");
    const vbad = await req("/api/admin/videos", { method: "POST", auth: true, json: { title: "V", source: "YOUTUBE", url: "https://example.com/not-a-video" } });
    check("invalid YouTube link → 422", vbad.status === 422, JSON.stringify(vbad.data));
    const vjs = await req("/api/admin/videos", { method: "POST", auth: true, json: { title: "V", source: "UPLOAD", url: "javascript:alert(1)" } });
    check("javascript: URL rejected", vjs.status === 422);
    const vok = await req("/api/admin/videos", { method: "POST", auth: true, json: { title: "Smoke Video", source: "YOUTUBE", url: "https://vimeo.com/123456789" } });
    check("Vimeo link auto-detected", vok.status === 201 && vok.data.item.source === "VIMEO", JSON.stringify(vok.data));
    await req(`/api/admin/videos/${vok.data.item.id}`, { method: "DELETE", auth: true });

    console.log("\nUploads");
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    const sign = await req("/api/admin/upload/sign", { method: "POST", auth: true, json: { kind: "image", type: "image/png", size: png.length } });
    check("upload sign ok", sign.status === 200 && ["server", "cloudinary"].includes(sign.data.mode), JSON.stringify(sign.data));
    const signBig = await req("/api/admin/upload/sign", { method: "POST", auth: true, json: { kind: "image", type: "image/png", size: 6 * 1024 * 1024 } });
    check("image over 5 MB rejected", signBig.status === 415);
    const signGif = await req("/api/admin/upload/sign", { method: "POST", auth: true, json: { kind: "image", type: "image/gif", size: 100 } });
    check("GIF type rejected", signGif.status === 415);
    if (sign.data.mode === "server") {
      const fd = new FormData();
      fd.append("kind", "image");
      fd.append("file", new Blob([png], { type: "image/png" }), "dot.png");
      const up = await req("/api/admin/upload", { method: "POST", auth: true, form: fd });
      check("upload PNG", up.status === 200 && up.data.url?.startsWith("/uploads/"), JSON.stringify(up.data));
      const file = await fetch(BASE + up.data.url);
      check("uploaded file served with image/png", file.status === 200 && file.headers.get("content-type") === "image/png");
      const range = await fetch(BASE + up.data.url, { headers: { range: "bytes=0-9" } });
      check("HTTP Range supported (206)", range.status === 206 && (await range.arrayBuffer()).byteLength === 10);
      const opt = await fetch(`${BASE}/_next/image?url=${encodeURIComponent(up.data.url)}&w=64&q=75`);
      check("next/image optimises uploaded file", opt.status === 200, `(got ${opt.status})`);

      const fake = new FormData();
      fake.append("kind", "image");
      fake.append("file", new Blob(["<?php echo 'hi'; ?>"], { type: "image/png" }), "evil.png");
      const upFake = await req("/api/admin/upload", { method: "POST", auth: true, form: fake });
      check("fake image (wrong magic bytes) rejected", upFake.status === 415, JSON.stringify(upFake.data));
      const trav = await fetch(`${BASE}/uploads/..%2F.env`);
      check("path traversal blocked", trav.status === 404);

      // Gallery image lifecycle (deleting removes the file)
      const albums = await req("/api/admin/albums", { auth: true });
      const img = await req("/api/admin/images", { method: "POST", auth: true, json: { albumId: albums.data.items[0].id, url: up.data.url, caption: "smoke" } });
      check("add photo to album", img.status === 201);
      const cap = await req(`/api/admin/images/${img.data.item.id}`, { method: "PATCH", auth: true, json: { caption: "edited caption" } });
      check("edit caption", cap.data?.item?.caption === "edited caption");
      await req(`/api/admin/images/${img.data.item.id}`, { method: "DELETE", auth: true });
      const after = await fetch(BASE + up.data.url);
      check("deleting photo removes file", after.status === 404, `(got ${after.status})`);
    }

    console.log("\nSettings, feedback, inquiries");
    const s0 = (await req("/api/admin/settings", { auth: true })).data.item;
    const { id: _i, updatedAt: _u, ...settings } = s0;
    const s1 = await req("/api/admin/settings", { method: "PUT", auth: true, json: { ...settings, phone: "+91 99999 11111", mapEmbedUrl: '<iframe src="https://www.google.com/maps/embed?pb=abc" width="600"></iframe>' } });
    check("update settings + extract map src from iframe code", s1.status === 200 && s1.data.item.mapEmbedUrl === "https://www.google.com/maps/embed?pb=abc", s1.data.item?.mapEmbedUrl);
    const home = await req("/");
    check("new phone shown on website", home.text.includes("+91 99999 11111"));
    const evilMap = await req("/api/admin/settings", { method: "PUT", auth: true, json: { ...settings, mapEmbedUrl: "https://evil.example/embed" } });
    check("non-Google map URL dropped", evilMap.data.item.mapEmbedUrl === "");
    await req("/api/admin/settings", { method: "PUT", auth: true, json: settings });

    const fb = await req("/api/admin/feedback?status=PENDING", { auth: true });
    if (fb.data.items?.length) {
      const f = fb.data.items[0];
      const ap = await req(`/api/admin/feedback/${f.id}`, { method: "PATCH", auth: true, json: { status: "APPROVED" } });
      check("approve feedback", ap.data.item.status === "APPROVED");
      await req(`/api/admin/feedback/${f.id}`, { method: "PATCH", auth: true, json: { status: "PENDING" } });
    }
    const fbCreate = await req("/api/admin/feedback", { method: "POST", auth: true, json: { name: "x", message: "y" } });
    check("admin cannot create fake feedback via API", fbCreate.status === 405);
    const inq = await req("/api/admin/inquiries", { auth: true });
    if (inq.data.items?.length) {
      const i = inq.data.items[0];
      const r1 = await req(`/api/admin/inquiries/${i.id}`, { method: "PATCH", auth: true, json: { status: "REPLIED" } });
      check("mark inquiry replied", r1.data.item.status === "REPLIED");
      const r2 = await req(`/api/admin/inquiries/${i.id}`, { method: "PATCH", auth: true, json: { status: "BOGUS" } });
      check("invalid status rejected", r2.status === 422);
      await req(`/api/admin/inquiries/${i.id}`, { method: "PATCH", auth: true, json: { status: i.status } });
    }
    const csv = await req("/api/admin/export/inquiries", { auth: true });
    check("CSV export", csv.status === 200 && (csv.headers.get("content-type") || "").includes("text/csv") && csv.text.includes('"Name"'));
  },

  async forms() {
    // A random client IP per run keeps rate-limit tests repeatable.
    const ip = `10.${rnd()}.${rnd()}.${rnd()}`;
    const H = { "x-forwarded-for": ip };
    const valid = { name: "Smoke Tester", phone: "+91 98765 43210", email: "smoke@example.com", subject: "Smoke", preferredTime: "Any time", message: "=HYPERLINK(\"x\") This is a smoke test message.", website: "" };

    console.log("\nContact form");
    const before = (await req("/api/admin/inquiries?limit=500", { auth: true })).data.items.length;
    const ok1 = await req("/api/contact", { method: "POST", json: valid, headers: H });
    check("valid inquiry → 201", ok1.status === 201, JSON.stringify(ok1.data));
    const bad = await req("/api/contact", { method: "POST", json: { ...valid, phone: "abc", message: "short" }, headers: H });
    check("invalid inquiry → 422 with field errors", bad.status === 422 && bad.data.fields?.phone && bad.data.fields?.message, JSON.stringify(bad.data));
    const hp = await req("/api/contact", { method: "POST", json: { ...valid, website: "http://spam.example" }, headers: H });
    check("honeypot: pretends success", hp.status === 200);
    const cross = await req("/api/contact", { method: "POST", json: valid, headers: { ...H, origin: "https://evil.example" } });
    check("cross-site post blocked", cross.status === 403);
    const list = (await req("/api/admin/inquiries?limit=500", { auth: true })).data.items;
    check("only the valid inquiry was saved", list.length === before + 1, `${before} → ${list.length}`);
    const mine = list.find((i) => i.email === "smoke@example.com" && i.status === "NEW");
    check("saved inquiry has status NEW", !!mine);
    const csv = await req("/api/admin/export/inquiries?q=smoke", { auth: true });
    check("CSV neutralises formula injection", csv.text.includes(`"'=HYPERLINK`), csv.text.slice(0, 300));
    // 3 counted so far (valid, invalid, honeypot; the cross-site one is rejected before counting).
    // Limit is 5 per 10 minutes, so the 4th and 5th pass and the 6th is blocked.
    const r4 = await req("/api/contact", { method: "POST", json: valid, headers: H });
    const r5 = await req("/api/contact", { method: "POST", json: valid, headers: H });
    const rl = await req("/api/contact", { method: "POST", json: valid, headers: H });
    check("5 submissions allowed, 6th rate-limited (429)", r4.status === 201 && r5.status === 201 && rl.status === 429, `(got ${r4.status}, ${r5.status}, ${rl.status})`);
    for (const i of (await req("/api/admin/inquiries?limit=500", { auth: true })).data.items.filter((x) => x.email === "smoke@example.com")) {
      await req(`/api/admin/inquiries/${i.id}`, { method: "DELETE", auth: true });
    }

    console.log("\nFeedback form");
    const H2 = { "x-forwarded-for": `10.${rnd()}.${rnd()}.${rnd()}` };
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    const fd = (o, file) => {
      const f = new FormData();
      Object.entries(o).forEach(([k, v]) => f.append(k, v));
      if (file) f.append("photo", file, "p.png");
      return f;
    };
    const fbValid = { name: "Smoke Feedback", city: "Bhopal", rating: "5", message: "Very helpful consultation, thank you!", website: "" };
    const f1 = await req("/api/feedback", { method: "POST", form: fd(fbValid, new Blob([png], { type: "image/png" })), headers: H2 });
    check("valid feedback with photo → 201", f1.status === 201, JSON.stringify(f1.data));
    const pending = (await req("/api/admin/feedback?status=PENDING", { auth: true })).data.items.find((f) => f.name === "Smoke Feedback");
    check("feedback saved as PENDING with photo", pending && pending.photoUrl, JSON.stringify(pending));
    let page = await req("/feedback");
    check("pending feedback NOT shown publicly", !page.text.includes("Very helpful consultation, thank you!"));
    await req(`/api/admin/feedback/${pending.id}`, { method: "PATCH", auth: true, json: { status: "APPROVED" } });
    page = await req("/feedback");
    check("approved feedback shown publicly", page.text.includes("Very helpful consultation, thank you!"));
    const f2 = await req("/api/feedback", { method: "POST", form: fd({ ...fbValid, rating: "9" }), headers: H2 });
    check("invalid rating → 422", f2.status === 422, JSON.stringify(f2.data));
    const f3 = await req("/api/feedback", { method: "POST", form: fd(fbValid, new Blob(["not an image"], { type: "image/png" })), headers: H2 });
    check("fake photo → 415 (rate limit reached would be 429)", f3.status === 415 || f3.status === 429, `(got ${f3.status})`);
    await req(`/api/admin/feedback/${pending.id}`, { method: "DELETE", auth: true });
  },
};

function rnd() {
  return Math.floor(Math.random() * 250) + 1;
}

(async () => {
  console.log(`Smoke testing ${BASE}`);
  for (const [name, fn] of Object.entries(sections)) {
    if (ONLY && ONLY !== name) continue;
    if (name === "admin" || name === "forms") {
      if (!jar.size) await login(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
    }
    await fn();
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
