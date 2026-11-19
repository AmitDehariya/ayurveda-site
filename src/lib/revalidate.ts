import "server-only";
import { revalidatePath } from "next/cache";

/**
 * After any admin change, refresh every cached public page. The site is small,
 * so revalidating everything is simpler and safer than tracking dependencies.
 */
export function refreshSite() {
  revalidatePath("/", "layout");
}
