import type { Prisma } from "@prisma/client";
import { textContains } from "./prisma";
import { INQUIRY_STATUSES } from "./validators";

/** Shared filter for the inquiries list and the CSV export (?status=&q=). */
export function inquiryWhere(params: URLSearchParams): Prisma.InquiryWhereInput {
  const where: Prisma.InquiryWhereInput = {};
  const status = params.get("status");
  if (status && (INQUIRY_STATUSES as readonly string[]).includes(status)) where.status = status;
  const q = (params.get("q") ?? "").trim().slice(0, 100);
  if (q) {
    where.OR = [
      { name: textContains(q) }, { email: textContains(q) }, { phone: textContains(q) },
      { subject: textContains(q) }, { message: textContains(q) },
    ];
  }
  return where;
}
