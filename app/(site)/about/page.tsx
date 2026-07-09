import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, GraduationCap, PlayCircle, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Radio From Scratch — a curated radiology education resource for verified medical learners.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-navy">
        About Radio From Scratch
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Radio From Scratch is a curated front door to selected
        radiology teaching videos. It is designed to feel like an educational
        library rather than an entertainment feed: calm, credible, and easy to
        scan.
      </p>

      <div className="mt-10 space-y-6">
        <Section
          icon={<PlayCircle className="size-5" />}
          title="Curated, not a YouTube clone"
          body="Videos are hosted on YouTube. This site maintains its own curated catalog of titles, descriptions, categories, and access levels, so it keeps working even when a channel feed is empty."
        />
        <Section
          icon={<GraduationCap className="size-5" />}
          title="For medical learners"
          body="The audience is radiology residents, medical students, physicians, allied health professionals, and researchers or institutional staff with a medical organization email address."
        />
        <Section
          icon={<ShieldCheck className="size-5" />}
          title="Verified membership"
          body="Public visitors can preview selected lessons and see what the full library offers. The complete catalog is reserved for members who sign up with an institutional medical email, are approved, and verify their email address."
        />
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-accent/40 p-8 text-center">
        <h2 className="text-xl font-semibold text-navy">
          Ready to access the full library?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Request member access with your hospital, university, or health-system
          email address.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            Request Member Access
          </Link>
          <Link
            href="/videos"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Browse Previews
          </Link>
        </div>
      </div>

      <p className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Mail className="size-4" />
        Questions about access? Contact the site owner.
      </p>
    </div>
  );
}

function Section({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <h3 className="font-semibold text-navy">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}
