import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-leaf-pattern grid min-h-screen place-items-center px-4 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest-800 text-gold-300"><Leaf className="h-8 w-8" aria-hidden="true" /></span>
        <h1 className="heading-lg mt-6">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page you are looking for may have been moved or removed.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild><Link href="/">Go to home</Link></Button>
          <Button asChild variant="outline"><Link href="/contact">Contact us</Link></Button>
        </div>
      </div>
    </main>
  );
}
