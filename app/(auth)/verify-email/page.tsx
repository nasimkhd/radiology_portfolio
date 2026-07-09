import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ResendVerification } from "@/components/auth/resend-verification";
import { signOutAction } from "@/app/actions/auth";
import { getViewerContext } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Verify Your Email",
};

export default async function VerifyEmailPage() {
  const { user, profile, isApprovedMember, emailVerified } =
    await getViewerContext();

  // Already verified + approved → member library.
  if (isApprovedMember) redirect("/dashboard/videos");

  // Verified but still waiting on admin review → pending page.
  if (emailVerified && profile?.membership_status === "pending") {
    redirect("/pending-approval");
  }
  if (emailVerified && profile?.membership_status === "rejected") {
    redirect("/pending-approval?status=rejected");
  }
  // Verified + approved is handled by isApprovedMember above.
  // Verified with no profile yet → pending.
  if (emailVerified && !profile) {
    redirect("/pending-approval");
  }

  const nextStep =
    profile?.membership_status === "approved"
      ? "Once verified, you can sign in and access the full video library."
      : "After you verify, your account will be reviewed for member access.";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center px-4 py-12">
      <Card className="w-full p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent">
          <MailCheck className="size-7 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-navy">
          Verify your email address
        </h1>
        <p className="mt-3 text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-navy">
            {user?.email ?? "your inbox"}
          </span>
          . Click the link to confirm you own this email. {nextStep}
        </p>

        <div className="mt-8 space-y-3">
          <ResendVerification email={user?.email ?? null} />
          <Link
            href="/videos"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
          >
            Browse preview videos
          </Link>
          {user && (
            <form action={signOutAction}>
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
