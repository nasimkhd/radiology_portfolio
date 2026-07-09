import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PlayCircle,
  GraduationCap,
  Link2,
  Lock,
  LockKeyhole,
} from "lucide-react";
import { AuthBackground } from "@/components/auth/auth-background";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card } from "@/components/ui/card";
import { getViewerContext } from "@/lib/auth";
import { allowPersonalEmailSignup } from "@/lib/env";

export const metadata: Metadata = {
  title: "Request Member Access",
  description:
    "Request access to the full radiology video library with your institutional medical email.",
};

export default async function SignUpPage() {
  const { isApprovedMember } = await getViewerContext();
  if (isApprovedMember) redirect("/dashboard/videos");

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <AuthBackground variant="sign-up" />

      <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        {/* Left: imagery + value proposition */}
        <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-14">
          <Image
            src="/auth/signup-bg.webp"
            alt=""
            fill
            priority
            sizes="40vw"
            className="object-cover object-left opacity-20 [mask-image:linear-gradient(to_right,black_20%,transparent_75%)]"
          />

          <div className="relative mx-auto max-w-md -translate-y-10">
            <h1 className="font-serif text-4xl font-bold leading-tight text-navy">
              Request Member Access
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">  
              Use your hospital, university, medical school, or health-system
              email address. Personal email addresses are not eligible.
            </p>

            <ul className="mt-10 space-y-6">
              <Benefit
                icon={<PlayCircle className="size-5" />}
                title="Full curated video catalog"
                body="Access our entire library of radiology videos and cases."
              />
              <Benefit
                icon={<GraduationCap className="size-5" />}
                title="Members-only radiology lessons"
                body="In-depth lessons and case discussions for every subspecialty."
              />
              <Benefit
                icon={<Link2 className="size-5" />}
                title="YouTube links revealed after login"
                body="We reveal links so you can watch on YouTube — after you sign in."
              />
            </ul>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:py-14">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-navy">
                <Lock className="size-5 text-primary" />
                Request Member Access
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Use your institutional medical email address.
              </p>
            </div>

            <Card className="border-border/80 p-8 shadow-xl shadow-navy/8 sm:p-10">
              <SignUpForm allowPersonalEmail={allowPersonalEmailSignup} />
            </Card>

            <div className="mt-8 space-y-4 text-center text-xs leading-relaxed text-muted-foreground">
              <p className="flex items-start justify-center gap-2">
                <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
                <span>
                  We respect your privacy. Your information will never be
                  shared.{" "}
                  <Link href="/about" className="font-semibold text-primary hover:underline">
                    View our Privacy Policy
                  </Link>
                  .
                </span>
              </p>
              <p className="flex items-start justify-center gap-2">
                <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
                <span>
                  Radio From Scratch is an educational resource for healthcare
                  professionals. Content is not a substitute for professional
                  medical advice, diagnosis, or treatment.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-navy">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}
