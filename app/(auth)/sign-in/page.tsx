import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck, PlayCircle } from "lucide-react";
import { AuthBackground } from "@/components/auth/auth-background";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Card } from "@/components/ui/card";
import { getViewerContext } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to the Radio From Scratch member video library.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const { isApprovedMember } = await getViewerContext();
  if (isApprovedMember) redirect(next ?? "/dashboard/videos");

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <AuthBackground variant="sign-in" />

      <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        {/* Left: imagery + reassurance */}
        <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-14">
          <div className="relative mx-auto w-full max-w-md pt-10 -translate-y-14">
            <div className="relative mb-8 w-full">
              <Image
                src="/auth/signin-bg.jpg"
                alt=""
                width={1212}
                height={708}
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="relative z-10 h-auto w-full object-contain object-left [mask-image:linear-gradient(to_bottom,black_50%,transparent_95%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-[45%] -bottom-6 overflow-hidden"
              >
                <Image
                  src="/auth/signin-bg.jpg"
                  alt=""
                  width={1212}
                  height={708}
                  className="absolute inset-x-0 -top-[58%] w-full scale-[1.03] object-contain object-left blur-2xl opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/55 to-background" />
              </div>
            </div>

            <ul className="space-y-8">
              <Reassurance
                icon={<ShieldCheck className="size-5" />}
                title="Verified medical members"
                body="Our community is composed of verified medical professionals."
              />
              <Reassurance
                icon={<PlayCircle className="size-5" />}
                title="Full video catalog"
                body="Approved members get access to our curated radiology video library on YouTube."
              />
            </ul>

            <div className="my-8 h-px bg-border" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              Radio From Scratch provides high-quality, peer-curated educational
              videos to help radiologists and trainees learn, review, and stay
              current.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center px-4 py-14 sm:px-8 lg:py-20">
          <Card className="w-full max-w-xl border-border/80 p-10 shadow-xl shadow-navy/8 sm:p-14">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Welcome back
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Sign in to continue to the member video library.
            </p>
            <div className="mt-10">
              <SignInForm next={next} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Reassurance({
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
