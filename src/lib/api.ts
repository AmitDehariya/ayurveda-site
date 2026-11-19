import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { getAdmin } from "./admin-guard";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(error: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

/** Turn Zod issues into { field: message } for the admin forms. */
export function zodFieldErrors(err: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    const fields = zodFieldErrors(err);
    return fail(Object.values(fields)[0] ?? "Please check the form", 422, { fields });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return fail("This value is already used (for example the URL slug). Please choose another.", 409);
    if (err.code === "P2025") return fail("Item not found – it may have been deleted.", 404);
  }
  if (err instanceof SyntaxError) return fail("Invalid request data", 400);
  console.error("[api] unexpected error", err);
  return fail("Something went wrong. Please try again.", 500);
}

/** Reject cross-site requests that try to use the admin's cookies (CSRF). */
function sameOrigin(req: Request) {
  if (req.method === "GET" || req.method === "HEAD") return true;
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers / server-to-server
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type Ctx<P> = { params: Promise<P> };
type Admin = NonNullable<Awaited<ReturnType<typeof getAdmin>>>;

/**
 * Wrap an admin route handler: checks the session (defence in depth after
 * middleware), blocks cross-site requests, and converts errors to JSON.
 */
export function withAdmin<P = Record<string, string>>(
  handler: (req: Request, ctx: { params: P; admin: Admin }) => Promise<Response>,
) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      if (!sameOrigin(req)) return fail("Cross-site request blocked", 403);
      const admin = await getAdmin();
      if (!admin) return fail("Please sign in again.", 401);
      return await handler(req, { params: await ctx.params, admin });
    } catch (err) {
      return handleError(err);
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  const text = await req.text();
  if (text.length > 1_000_000) throw new SyntaxError("Body too large");
  return text ? JSON.parse(text) : {};
}
