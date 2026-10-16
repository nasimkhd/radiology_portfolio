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
          title="For medical learners and Radiology Enthusiasts"
          body="Our educational content is designed for medical students, radiology residents, physicians, professionals, researchers, and anyone interested in learning more about radiology. "
        />
        <Section
          icon={<ShieldCheck className="size-5" />}
          title="Verified membership"
          body="Public visitors can preview selected lessons, watch publicly available videos, and browse the topics coovered in our full library. However, access to our complete catalog of educational videos is reserved for members who sign up and verify their email addresses."
        />
      </div>


      <div className="mt-12 rounded-2xl border border-border bg-accent/40 p-8 text-center">
        <h2 className="text-xl font-semibold text-navy">
          Ready to access the full library?
        </h2>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            Sign Up
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
