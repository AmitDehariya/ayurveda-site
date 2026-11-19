# Dr. Deepmala Mourya – Ayurveda Website

A full-stack website for an Ayurvedic physician and professor. It includes a public site (profile, services, articles, gallery, videos, testimonials, contact) and a simple admin panel where **all** content can be edited without touching code.

📚 **Team documentation** (with diagrams) is in [`docs/`](docs/README.md): [project overview](docs/1-project-overview.md) for managers · [architecture & structure](docs/2-architecture.md) · [developer guide](docs/3-developer-guide.md) · [testing guide](docs/4-testing-guide.md).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS + shadcn-style UI · Framer Motion · Prisma (SQLite locally, PostgreSQL in production) · NextAuth (credentials + bcrypt) · Cloudinary (uploads) · TipTap (rich text) · Zod + React Hook Form · Nodemailer

---

## Contents

1. [Quick start (local)](#1-quick-start-local)
2. [Environment variables](#2-environment-variables)
3. [Useful commands](#3-useful-commands)
4. [Create / reset the admin password](#4-create--reset-the-admin-password)
5. [Deploy: Vercel + PostgreSQL + Cloudinary](#5-deploy-vercel--postgresql-neon-or-supabase--cloudinary)
6. [Project structure](#6-project-structure)
7. [Security & spam protection](#7-security--spam-protection)
8. [Testing](#8-testing)
9. [How to use the admin panel (guide for the doctor)](#9-how-to-use-the-admin-panel)
10. [Known limitations](#10-known-limitations)

---

## 1. Quick start (local)

Requirements: **Node.js 20+** (tested on Node 24) and npm.

```bash
cd ayurveda-site
npm install
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
```

Open `.env` and set at least:

- `NEXTAUTH_SECRET`: any long random string (e.g. run `npx auth secret` or `openssl rand -base64 32`)
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: the first admin login (password at least 8 characters)

Then create the database, add the sample content and start the site:

```bash
npx prisma migrate dev        # creates prisma/dev.db (SQLite) and runs the seed
npm run dev
```

- Website: http://localhost:3000
- Admin panel: http://localhost:3000/admin (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

The seed adds sample settings, 3 services, 2 articles, 2 gallery albums, 2 sample videos, sample testimonials and stats, so the site looks complete straight away. Personal details are **[placeholders]** for the doctor to fill in from the admin panel.

> Without Cloudinary keys, uploads are saved to the local `uploads/` folder. That is fine for development but **not** for Vercel (see Deploy).

## 2. Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | `file:./dev.db` locally; a PostgreSQL URL in production |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public URL without a trailing slash, e.g. `https://drdeepmalamourya.in`. Used for SEO, sitemap and sharing |
| `NEXTAUTH_SECRET` | ✅ | Long random string used to sign login sessions |
| `NEXTAUTH_URL` | ✅ (non-Vercel) | Same as the site URL. Vercel detects it automatically |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | seed only | First admin user, created by the seed script |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | production | Leave empty to use local disk storage |
| `CLOUDINARY_FOLDER` | optional | Cloudinary folder name (default `dr-deepmala-mourya`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | optional | Email sending. If `SMTP_HOST` is empty, notifications are printed to the server log instead |
| `MAIL_FROM` | optional | Sender, e.g. `Website <no-reply@yourdomain.com>` |
| `NOTIFY_EMAIL` | optional | The doctor's email, which receives new inquiry and feedback notifications |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | optional | Google reCAPTCHA **v3** keys. Leave empty to disable |
| `RECAPTCHA_MIN_SCORE` | optional | Default `0.5` |

**Gmail SMTP example:** `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER=you@gmail.com`, `SMTP_PASS=<a Google "App password">`. A normal Gmail password will not work.

Never commit `.env`. It is already in `.gitignore`.

## 3. Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build / start |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run db:migrate` | Create / apply migrations (development) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Add the admin user and sample content. Safe to run again: it only fills empty tables |
| `npm run db:reset` | ⚠️ Delete **all** data and re-seed |
| `npm run db:studio` | Open Prisma Studio (a database browser) |
| `npm run admin:reset-password` | Create the admin or reset their password (see below) |
| `npm run test:smoke` | End-to-end checks against a running server |
| `npm run placeholders` | Regenerate the placeholder SVG artwork |

## 4. Create / reset the admin password

**From the admin panel:** *Change Password* (asks for the current password).

**Forgotten password / new admin:** run this on a computer whose `.env` points at the right database:

```bash
npm run admin:reset-password -- --email doctor@example.com --password "New-Strong-Pass-123"
```

Without arguments it uses `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. If the email doesn't exist yet, the admin is created. Every existing login session for that admin is signed out.

For production, run it with the production `DATABASE_URL`, for example:

```bash
DATABASE_URL="postgresql://..." npm run admin:reset-password -- --email doctor@example.com --password "..."
```

## 5. Deploy: Vercel + PostgreSQL (Neon or Supabase) + Cloudinary

### a) Switch the database to PostgreSQL

1. Create a free database on **[Neon](https://neon.tech)** or **[Supabase](https://supabase.com)** and copy its connection string.
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
   - Neon / Supabase give you a *pooled* URL and a *direct* URL. Use the pooled one as `DATABASE_URL` and add `directUrl = env("DIRECT_URL")` to the `datasource` block, with the direct URL in `DIRECT_URL`.
3. The migration in `prisma/migrations` is SQLite-specific, so create a fresh one for Postgres: delete the `prisma/migrations` folder, set `DATABASE_URL` (and `DIRECT_URL`) in `.env` to the Postgres URLs, then run:
   ```bash
   npx prisma migrate dev --name init     # creates the tables + runs the seed
   ```
   Commit the new `prisma/migrations` folder.

The schema avoids database-specific features, and search queries switch to case-insensitive mode on Postgres automatically (`textContains` in `src/lib/prisma.ts`).

### b) Cloudinary (photos and videos)

Create a free [Cloudinary](https://cloudinary.com) account and copy the **Cloud name**, **API key** and **API secret** from the dashboard. Admin uploads go **directly from the browser to Cloudinary** using a signed request, so 100 MB videos work even though Vercel limits request bodies to about 4.5 MB.

All storage code lives in `src/lib/storage.ts`, so another provider (S3, R2, …) can be added there.

### c) Vercel

1. Push the project to GitHub and import it in [Vercel](https://vercel.com).
2. Vercel uses the `vercel-build` script automatically (`prisma generate && prisma migrate deploy && next build`).
3. Add the environment variables from section 2 (Production): `DATABASE_URL` (+ `DIRECT_URL`), `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_SECRET`, the Cloudinary keys, the SMTP settings, `NOTIFY_EMAIL` and the optional reCAPTCHA keys.
4. Deploy, then add your domain under *Settings → Domains* and update `NEXT_PUBLIC_SITE_URL`.
5. Sign in at `https://yourdomain/admin` and replace the placeholders.

After going live, submit `https://yourdomain/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

**Other hosts (VPS, Railway, Render…):** `npm run build && npm run db:deploy && npm start`. Run it behind a reverse proxy (e.g. Nginx) that sets `X-Forwarded-For`, so rate limiting sees the real visitor IP. Without Cloudinary, keep the `uploads/` folder on persistent storage and back it up.

## 6. Project structure

```
prisma/
  schema.prisma            database models
  seed.ts                  admin user + sample content
scripts/
  reset-admin-password.ts  create/reset admin
  smoke.mjs                end-to-end test script
  generate-placeholders.mjs
src/
  middleware.ts            protects /admin and /api/admin
  app/
    (site)/                public pages (home, about, services, blog, gallery, videos, feedback, contact)
    admin/login            login page
    admin/(panel)/         admin pages (dashboard, settings, profile, services, blog, gallery, videos, feedback, inquiries, stats, password)
    api/admin/[resource]   generic REST API for admin lists (see src/lib/resources.ts)
    api/admin/...          settings, profile, password, upload, CSV export
    api/contact, api/feedback   public forms
    uploads/[...path]      serves local uploads (dev / self-hosting)
    sitemap.ts, robots.ts, og/  SEO
  components/
    ui/                    buttons, inputs, dialogs (shadcn-style)
    site/                  public components (navbar, footer, hero, cards, slider, forms…)
    admin/                 admin components (ResourceManager, forms, media upload, rich-text editor)
  lib/
    validators.ts          Zod schemas (shared by browser and server)
    resources.ts           registry behind the generic admin API
    storage.ts             upload storage (Cloudinary / local), one module
    sanitize.ts            rich-text HTML sanitiser
    auth.ts, admin-guard.ts, api.ts      authentication + API helpers
    rate-limit.ts, public-form.ts, recaptcha.ts   spam protection
    mail.ts                email notifications
    queries.ts, settings.ts               public data access
```

**Admin REST API** (all require login): `GET/POST /api/admin/:resource`, `GET/PUT/PATCH/DELETE /api/admin/:resource/:id`, `POST /api/admin/:resource/reorder`. The resources are `services, posts, categories, albums, images, videos, qualifications, timeline, achievements, publications, stats, feedback, inquiries`. Also: `PUT /api/admin/settings`, `PUT /api/admin/profile`, `POST /api/admin/password`, `POST /api/admin/upload/sign`, `POST /api/admin/upload`, `GET /api/admin/export/inquiries`.

## 7. Security & spam protection

- **Admin login:** bcrypt-hashed passwords (cost 12) and JWT sessions (3 days). Failed logins are rate-limited (5 per account / 10 per IP per 15 minutes), and timing is equalised so attackers can't tell which emails exist. Changing the password signs out all other sessions.
- **Two layers of access control:** middleware blocks `/admin` and `/api/admin`, then every admin API handler checks the session again against the database.
- **CSRF:** admin and public `POST` requests are rejected when the `Origin` is another website. Session cookies are `SameSite=Lax`.
- **Validation:** every input is validated with Zod **on the server** (the same schemas give instant feedback in the browser).
- **XSS:** rich text is sanitised with a strict allow-list both when saved and when displayed. JSON-LD is escaped, and `javascript:` URLs are rejected.
- **Uploads:** JPG/PNG/WebP up to 5 MB and MP4 up to 100 MB. The **real file type is checked from the file's bytes**, not the browser's claim. Local files get random names and path traversal is blocked.
- **Public forms:** honeypot field + per-IP rate limit (contact: 5 per 10 min, feedback: 3 per hour) + optional reCAPTCHA v3. Feedback stays hidden until approved.
- **Other:** CSV export is protected against formula injection; email headers can't be injected; security headers are set (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`); admin pages are `noindex`.

## 8. Testing

With the server running:

```bash
npm run test:smoke                                  # against http://localhost:3000
BASE_URL=http://localhost:3200 npm run test:smoke   # another port
npm run test:smoke -- forms                         # one section: pages | auth | admin | forms
```

It runs 88 checks covering public pages, login and protection, CRUD for every admin module, XSS sanitising, uploads (including fake files and path traversal), cache refresh after edits, contact/feedback forms, honeypot, rate limits and the CSV export. It cleans up the test data it creates.

## 9. How to use the admin panel

*A simple guide for Dr. Deepmala Mourya.*

**Signing in.** Go to **yourwebsite.com/admin** and enter your email and password. On a phone, tap the **☰** button at the top left to open the menu.

**Saving.** Every screen has a **Save** button. Changes appear on the website straight away. A green message means it worked; a red message tells you what to fix, and the field with the problem is highlighted.

**Adding a photo.** Click the photo box (or drag a photo onto it). You will see the photo at once while it uploads. Use JPG, PNG or WebP photos up to 5 MB. **Remove** takes the photo out; **Change** replaces it.

### What each menu item does

| Menu | What you can do |
|---|---|
| **Dashboard** | See new inquiries, feedback waiting for approval, and recent changes |
| **Inquiries** | Messages from the Contact form. Click one to read it (it is marked *read* automatically). Use **Call**, **WhatsApp** or **Reply by email**, then **Mark as replied**. **Export CSV** downloads everything as an Excel-friendly file |
| **Feedback** | New feedback waits here and is **not** on the website until you click **Approve**. **Feature** puts it first in the home page slider. **Reject** hides it |
| **Articles** | **Add article** → write the title, summary and text, then add a cover photo. Choose **Draft** while writing and **Published** when it is ready. The *Categories* tab manages article categories |
| **Services** | Add or edit treatments (photo, short text, full description). The **Visible** switch hides a service without deleting it, and the ↑ ↓ arrows change the order |
| **Gallery** | **Add album** (e.g. "Health Camp 2025"), then **Photos** → drag many photos at once. Click under a photo to type a caption. ★ makes a photo the album cover |
| **Videos** | **Add video** → paste a YouTube link (YouTube → Share → Copy link), or choose *Upload a video file* for an MP4 up to 100 MB |
| **Profile & About** | Your name, degrees, photo and biography, plus the tabs for Qualifications, Experience, Awards & certificates and Publications |
| **Home Numbers** | The highlight numbers on the home page (years of experience, students taught…) |
| **Site Settings** | Website name, logo, home page text, phone, email, WhatsApp number, address, timings, Google Map, social media links, footer text, and the Google (SEO) title and description |
| **Change Password** | Change your password (you will be asked to sign in again) |

### Writing tips for the text editor

- **B** = bold, *I* = italic, **H2 / H3** = headings, list buttons for bullet or numbered lists, “ = quote.
- 🔗 adds a link: select the words first, then click it and paste the address.
- 🖼 inserts a photo inside an article.
- Keep paragraphs short. Headings help readers and Google.

### Adding the Google Map

Open Google Maps, search for the clinic or college, then click **Share → Embed a map → Copy HTML** and paste it into *Site Settings → Google Map*. The website keeps only the safe map address.

### If something goes wrong

- *"Please sign in again"*: your session expired, so sign in again.
- *Upload failed*: check that the photo is JPG/PNG/WebP and under 5 MB (videos: MP4 under 100 MB).
- *Forgot password*: ask your website developer to run the reset command in section 4.

## 10. Known limitations

- **Rate limiting is in memory.** On serverless hosts each instance keeps its own counters, so limits are per instance. For strict limits, replace `src/lib/rate-limit.ts` with a shared store such as Upstash Redis (same function signature).
- **Local uploads don't work on Vercel** (its filesystem is temporary). Use Cloudinary in production.
- **Generated sharing image:** the `/og` image uses a Latin font. If the site name is in Hindi, upload a custom *Sharing image* in Site Settings.
- **`npm audit`** reports one advisory in `deepmerge-ts`, used only by the Prisma **CLI** at build time to merge its own config file. It is not part of the running website. The fix needs Prisma 7, a major upgrade with configuration changes; upgrade when convenient.
- The sample videos use placeholder links; replace them with real YouTube links from *Admin → Videos*.
