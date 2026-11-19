# 2. Architecture & Project Structure

*Audience: everyone for the diagrams; developers for the details.*

## 2.1 The big picture

```mermaid
flowchart TB
    subgraph Browser["Visitor / Admin browser"]
        P["Public pages"]
        AP["Admin panel (React)"]
    end

    subgraph Server["Next.js server (Node.js)"]
        MW["middleware.ts<br/>guards /admin & /api/admin"]
        RSC["Server-rendered pages<br/>(cached, refreshed every 5 min<br/>or instantly after admin edits)"]
        PUB["Public API<br/>/api/contact · /api/feedback"]
        ADM["Admin API<br/>/api/admin/*"]
        AUTH["NextAuth<br/>/api/auth/*"]
        LIB["src/lib<br/>validation · sanitising · rate limits · storage · mail"]
    end

    DB[("Database<br/>SQLite (dev) / PostgreSQL (prod)<br/>via Prisma")]
    CL[("Cloudinary<br/>images & videos")]
    LOCAL[("./uploads folder<br/>fallback when no Cloudinary")]
    SMTP["SMTP email server"]
    RC["Google reCAPTCHA (optional)"]

    P --> RSC
    P --> PUB
    AP --> MW --> ADM
    AP --> AUTH
    RSC --> LIB
    PUB --> LIB
    ADM --> LIB
    AUTH --> DB
    LIB --> DB
    LIB --> CL
    LIB --> LOCAL
    LIB --> SMTP
    LIB --> RC
    AP -. "signed direct upload" .-> CL
```

**Key ideas**

1. **One app, two faces.** The public site and the admin panel are one Next.js application. Route groups `(site)` and `admin/(panel)` give them separate layouts.
2. **Database is the single source of truth.** Every piece of text, image link and setting on the public site comes from the database, so the admin can change it all.
3. **Fast public pages.** Pages are pre-rendered and cached (ISR, `revalidate = 300`). When the admin saves anything, `refreshSite()` clears the cache so changes appear immediately.
4. **Swappable services.** Storage (Cloudinary ↔ local disk), database (SQLite ↔ PostgreSQL) and email are each isolated in one module.

## 2.2 Technology stack

```mermaid
flowchart LR
    subgraph UI["User interface"]
        R["React 19"] --- TW["Tailwind CSS"] --- FM["Framer Motion<br/>animations"] --- TT["TipTap<br/>rich-text editor"]
    end
    subgraph FW["Framework"]
        NX["Next.js 15<br/>App Router · TypeScript"]
    end
    subgraph DATA["Data & validation"]
        PR["Prisma ORM"] --- ZD["Zod schemas"] --- RHF["React Hook Form"]
    end
    subgraph SEC["Security"]
        NA["NextAuth (JWT)"] --- BC["bcrypt"] --- SH["sanitize-html"]
    end
    subgraph EXT["External services"]
        CD["Cloudinary"] --- NM["Nodemailer / SMTP"] --- RCP["reCAPTCHA v3"]
    end
    UI --> FW --> DATA
    FW --> SEC
    FW --> EXT
```

## 2.3 Folder structure

```mermaid
flowchart LR
    ROOT["ayurveda-site/"] --> PRISMA["prisma/<br/>database schema, migrations, seed data"]
    ROOT --> PUBLIC["public/<br/>favicon, placeholder images"]
    ROOT --> SCRIPTS["scripts/<br/>smoke tests, password reset, placeholder generator"]
    ROOT --> DOCS["docs/<br/>this documentation"]
    ROOT --> SRC["src/"]
    SRC --> APP["app/<br/>pages & API routes"]
    SRC --> COMP["components/<br/>reusable UI pieces"]
    SRC --> LIBD["lib/<br/>business logic & helpers"]
    SRC --> MWF["middleware.ts<br/>admin route protection"]
    APP --> SITE["(site)/ – public pages"]
    APP --> ADMINF["admin/ – admin pages"]
    APP --> API["api/ – server endpoints"]
    COMP --> CSITE["site/ – public UI"]
    COMP --> CADMIN["admin/ – admin UI"]
    COMP --> CUI["ui/ – basic building blocks"]
```

### Full tree with explanations

```text
ayurveda-site/
├── prisma/
│   ├── schema.prisma          # All database tables (models)
│   ├── migrations/            # Versioned database changes
│   └── seed.ts                # Fills an empty database with placeholder content
├── public/
│   ├── favicon.svg
│   └── placeholders/          # Placeholder SVG images (replace via admin)
├── scripts/
│   ├── smoke.mjs              # 88 automated end-to-end checks
│   ├── reset-admin-password.ts
│   └── generate-placeholders.mjs
├── docs/                      # Project documentation (you are here)
├── src/
│   ├── middleware.ts          # Redirects / blocks unauthenticated admin requests
│   ├── app/
│   │   ├── layout.tsx         # Root HTML, fonts, global SEO metadata
│   │   ├── globals.css        # Tailwind + shared styles
│   │   ├── not-found.tsx      # 404 page
│   │   ├── sitemap.ts         # /sitemap.xml
│   │   ├── robots.ts          # /robots.txt
│   │   ├── og/route.tsx       # Generated social-share image
│   │   ├── uploads/[...path]/ # Serves locally stored uploads (supports video seeking)
│   │   ├── (site)/            # PUBLIC PAGES (share navbar + footer layout)
│   │   │   ├── page.tsx                 # Home
│   │   │   ├── about/
│   │   │   ├── services/  + [slug]/     # list + detail
│   │   │   ├── blog/      + [slug]/     # list (search, category, pages) + article
│   │   │   ├── gallery/   + [slug]/     # albums + album photos
│   │   │   ├── videos/
│   │   │   ├── feedback/
│   │   │   └── contact/
│   │   ├── admin/
│   │   │   ├── login/                   # Sign-in page (public)
│   │   │   └── (panel)/                 # PROTECTED ADMIN PAGES (sidebar layout)
│   │   │       ├── page.tsx             # Dashboard
│   │   │       ├── settings/ profile/ services/ blog/ gallery/ gallery/[id]/
│   │   │       └── videos/ stats/ feedback/ inquiries/ password/
│   │   └── api/
│   │       ├── auth/[...nextauth]/      # Login / logout / session
│   │       ├── contact/                 # Public contact form
│   │       ├── feedback/                # Public feedback form (+ optional photo)
│   │       └── admin/
│   │           ├── [resource]/          # GET list · POST create   (generic)
│   │           ├── [resource]/[id]/     # GET · PUT · PATCH · DELETE (generic)
│   │           ├── [resource]/reorder/  # Drag-and-drop ordering
│   │           ├── settings/  profile/  password/
│   │           ├── upload/  upload/sign/  # File upload (local) / Cloudinary signature
│   │           └── export/inquiries/    # CSV download
│   ├── components/
│   │   ├── ui/      # button, input, label, card, badge, dialog, switch, confirm-dialog
│   │   ├── site/    # navbar, footer, hero, cards, forms, gallery grid, sliders, SEO JSON-LD…
│   │   └── admin/   # admin shell, generic resource manager/form, media field, rich-text editor
│   └── lib/         # See developer guide §3.4 for every function
├── .env.example     # Template for environment variables (no real secrets!)
├── next.config.ts   # Security headers, image domains, upload body size
├── tailwind.config.ts  # Colour palette: forest, gold, cream, earth
└── package.json     # Dependencies and npm scripts
```

## 2.4 Data model

```mermaid
erDiagram
    AdminUser {
        string id PK
        string email UK
        string passwordHash
        int tokenVersion "bumped on password change"
    }
    SiteSetting {
        int id PK "always 1"
        string siteName
        string heroTitle
        string phone
        string metaTitle
    }
    Profile {
        int id PK "always 1"
        string fullName
        string photoUrl
        string bioHtml
    }
    Qualification {
        string id PK
        string degree
        int order
    }
    TimelineItem {
        string id PK
        string period
        string title
    }
    Achievement {
        string id PK
        string kind "AWARD | CERTIFICATE | MEMBERSHIP"
        string title
    }
    Publication {
        string id PK
        string title
        string url
    }
    Service {
        string id PK
        string slug UK
        string contentHtml
        bool isVisible
    }
    Category {
        string id PK
        string type "BLOG | VIDEO"
        string slug
    }
    BlogPost {
        string id PK
        string slug UK
        string status "DRAFT | PUBLISHED"
        datetime publishedAt
    }
    GalleryAlbum {
        string id PK
        string slug UK
        string coverImageUrl
    }
    GalleryImage {
        string id PK
        string url
        string caption
    }
    Video {
        string id PK
        string source "YOUTUBE | VIMEO | UPLOAD"
        string url
        bool isFeatured
    }
    Feedback {
        string id PK
        string status "PENDING | APPROVED | REJECTED"
        int rating
        string ipHash
    }
    Inquiry {
        string id PK
        string status "NEW | READ | REPLIED"
        string message
        string ipHash
    }
    Stat {
        string id PK
        string label
        int value
    }
    ActivityLog {
        string id PK
        string action
        string summary
    }

    Category ||--o{ BlogPost : "groups (optional)"
    Category ||--o{ Video : "groups (optional)"
    GalleryAlbum ||--o{ GalleryImage : "contains"
```

**Rules worth knowing**

- `SiteSetting` and `Profile` are *singletons* – exactly one row (id = 1).
- Deleting a category leaves its posts/videos in place (`categoryId` becomes empty). Deleting an album deletes its photos **and** the stored files.
- Lists with an `order` column (services, photos, timeline…) can be drag-sorted in the admin.
- SQLite has no enums, so statuses are strings validated by Zod (`src/lib/validators.ts`).

## 2.5 How requests flow

### Viewing a public page

```mermaid
sequenceDiagram
    actor V as Visitor
    participant N as Next.js page (cached)
    participant Q as lib/queries + lib/settings
    participant DB as Database
    V->>N: GET /blog/my-article
    alt Cached copy fresh (< 5 min, no admin edits)
        N-->>V: HTML instantly
    else Not cached / stale
        N->>Q: getPostBySlug(), getSettings()
        Q->>DB: SELECT …
        DB-->>Q: rows
        Q-->>N: data (HTML already sanitised)
        N-->>V: HTML (and stores it in cache)
    end
```

### Submitting the contact form

```mermaid
sequenceDiagram
    actor V as Visitor
    participant F as ContactForm (browser)
    participant API as /api/contact
    participant G as guardPublicForm()
    participant DB as Database
    participant M as notifyAdmin()
    V->>F: fills form, clicks Send
    F->>F: client-side validation (Zod)
    F->>API: POST JSON (+ reCAPTCHA token)
    API->>G: same-origin? rate limit (5 / 10 min)? honeypot empty? reCAPTCHA ok?
    alt blocked
        G-->>API: error response
        API-->>F: 403 / 429 / 400
    else allowed
        API->>API: validate with contactSchema
        API->>DB: create Inquiry (status NEW, hashed IP)
        API->>M: send email alert (if SMTP configured)
        API-->>F: 200 OK
        F-->>V: success message
    end
```

### Admin saving content

```mermaid
sequenceDiagram
    actor A as Admin
    participant UI as ResourceForm
    participant MW as middleware.ts
    participant R as /api/admin/[resource]/[id]
    participant W as withAdmin()
    participant L as lib/resources
    participant DB as Database
    A->>UI: edits a service, clicks Save
    UI->>MW: PUT /api/admin/services/abc
    MW->>MW: valid session cookie?
    MW->>R: continue
    R->>W: getAdmin() checks DB + tokenVersion, same-origin check
    W->>L: getResource("services") → schema, hooks
    L->>L: Zod validate → sanitise HTML → unique slug
    L->>DB: UPDATE service
    R->>R: logActivity() + refreshSite()
    R-->>UI: 200 + saved row
    UI-->>A: "Saved" toast
```

### Admin login

```mermaid
sequenceDiagram
    actor A as Admin
    participant L as /admin/login
    participant NA as NextAuth authorize()
    participant RL as rate-limit
    participant DB as Database
    A->>L: email + password
    L->>NA: credentials
    NA->>RL: isRateLimited(ip / email)?
    alt locked (5 fails per email or 10 per IP in 15 min)
        NA-->>L: TOO_MANY_ATTEMPTS
    else
        NA->>DB: find AdminUser
        NA->>NA: bcrypt.compare (dummy hash if user missing – same timing)
        alt wrong
            NA->>RL: count failure
            NA-->>L: error
        else correct
            NA-->>L: JWT session cookie (includes tokenVersion)
            L-->>A: redirect to /admin
        end
    end
```

### File upload

```mermaid
flowchart TD
    S["Admin picks a file"] --> C1{"Type & size OK?<br/>(checked in browser)"}
    C1 -- No --> E1["Error shown immediately"]
    C1 -- Yes --> Q{"Cloudinary configured?"}
    Q -- Yes --> SIG["POST /api/admin/upload/sign<br/>server returns a signature"]
    SIG --> UP["Browser uploads straight to Cloudinary"]
    UP --> URL1["https://res.cloudinary.com/… URL"]
    Q -- No --> LOC["POST /api/admin/upload"]
    LOC --> SN{"Server re-checks size<br/>+ real type from file bytes"}
    SN -- Bad --> E2["Rejected"]
    SN -- OK --> SAVE["Saved to ./uploads/YYYY/MM/"]
    SAVE --> URL2["/uploads/… URL"]
    URL1 --> F["URL stored in the form field → saved with the record"]
    URL2 --> F
```

## 2.6 Security layers

```mermaid
flowchart TB
    REQ["Incoming request"] --> H["HTTP security headers<br/>(next.config.ts: X-Frame-Options, nosniff,<br/>Referrer-Policy, Permissions-Policy, noindex on /admin)"]
    H --> T{"Admin route?"}
    T -- Yes --> M1["middleware.ts: session cookie required"]
    M1 --> M2["withAdmin(): session re-checked against DB<br/>(tokenVersion) + same-origin (CSRF)"]
    T -- Public form --> G["guardPublicForm(): same-origin · rate limit · honeypot · reCAPTCHA"]
    M2 --> V["Zod validation (strict schemas)"]
    G --> V
    V --> S["sanitize-html on rich text<br/>(on save AND on render)"]
    S --> DB[("Database via Prisma<br/>(parameterised – no SQL injection)")]
```
