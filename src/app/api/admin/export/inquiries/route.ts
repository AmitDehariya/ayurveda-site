import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/api";
import { inquiryWhere } from "@/lib/inquiries";

/**
 * CSV cell: quote it, double inner quotes, and neutralise values starting with
 * = + - @ so spreadsheet apps don't execute them as formulas (CSV injection).
 */
function cell(v: unknown) {
  let s = v instanceof Date ? v.toLocaleString("en-IN") : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export const GET = withAdmin(async (req) => {
  const params = new URL(req.url).searchParams;
  const rows = await prisma.inquiry.findMany({ where: inquiryWhere(params), orderBy: { createdAt: "desc" }, take: 10_000 });
  const header = ["Date", "Name", "Phone", "Email", "Subject", "Preferred time", "Message", "Status"];
  const lines = rows.map((r) => [r.createdAt, r.name, r.phone, r.email, r.subject, r.preferredTime, r.message, r.status].map(cell).join(","));
  // BOM so Excel opens Hindi / Unicode text correctly.
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
