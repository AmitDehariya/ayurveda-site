# Project Documentation – Dr. Deepmala Mourya Ayurveda Website

This folder explains the project for everyone on the team. Pick the guide for your role:

| Guide | Who it is for | What you will learn |
|---|---|---|
| [1. Project overview](1-project-overview.md) | Managers, clients, anyone new | What the website does, the features, how the work flows, current status |
| [2. Architecture & structure](2-architecture.md) | Everyone (diagrams) · Developers (details) | How the pieces fit together, folder structure, data model, request flows |
| [3. Developer guide](3-developer-guide.md) | Developers | Setup, commands, every module and its functions, how to add features |
| [4. Testing guide](4-testing-guide.md) | Testers / QA | Automated tests, manual test cases, security checks, bug report template |

The admin user guide (how the doctor edits content) lives in the main [README](../README.md#admin-guide).

## Quick facts

| | |
|---|---|
| **Type** | Personal website + content management panel for an Ayurvedic doctor & professor (Bhopal) |
| **Tech** | Next.js 15 (React 19, TypeScript) · Tailwind CSS · Prisma ORM · SQLite (dev) / PostgreSQL (prod) · NextAuth |
| **Public site** | Home, About, Services, Blog, Gallery, Videos, Feedback, Contact |
| **Admin panel** | `/admin` – edit every page, moderate feedback, read inquiries, export CSV |
| **Run locally** | `npm install` → `npm run db:migrate` → `npm run dev` → <http://localhost:3000> |
| **Repository** | <https://github.com/AmitDehariya/ayurveda-site> |

## Viewing the diagrams

The diagrams are written in [Mermaid](https://mermaid.js.org/). They render automatically:

- **on GitHub** – just open the file in the repository, and
- **in VS Code** – open a `.md` file and press `Ctrl+Shift+V` (Markdown preview). The *Markdown Preview Mermaid Support* extension (`bierner.markdown-mermaid`) is required and is installed on the main dev machine.

## Keeping these docs up to date

- When you add a page, API route, database table or library function, update the matching section in guide 2 or 3 **in the same commit**.
- When you fix a bug that a tester found, add a test case for it to guide 4.
- Diagrams are plain text – edit them like code and preview them before committing.
