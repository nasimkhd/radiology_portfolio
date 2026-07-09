import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-md gap-3">
            <ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-navy">Disclaimer</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Educational content only. This site does not provide medical
                advice, diagnosis, or treatment, and is not a substitute for
                professional medical judgment. Do not share
                patient-identifiable information.
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-navy">Explore</span>
            <Link href="/videos" className="text-muted-foreground hover:text-primary">
              Videos
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary">
              About
            </Link>
            <Link href="/sign-up" className="text-muted-foreground hover:text-primary">
              Request member access
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Radio From Scratch. All
            rights reserved.
          </p>
          <p>Videos hosted on YouTube. Curated for medical learners.</p>
        </div>
      </div>
    </footer>
  );
}
