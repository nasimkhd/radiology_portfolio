import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, CircleCheck, CircleX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";
import { getViewerContext } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account Pending Approval",
};

export default async function PendingApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; new?: string }>;
}) {
  const { status } = await searchParams;
  const { user, profile, isApprovedMember, emailVerified } =
    await getViewerContext();

  if (isApprovedMember) redirect("/dashboard/videos");

  // Email must be verified before waiting on admin review.
  if (user && !emailVerified) {
    redirect("/verify-email");
  }

  const rejected =
    status === "rejected" || profile?.membership_status === "rejected";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center px-4 py-12">
      <Card className="w-full p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent">
          {rejected ? (
            <CircleX className="size-7 text-destructive" />
          ) : (
            <Clock className="size-7 text-primary" />
          )}
        </div>

        <div className="mt-4 flex justify-center">
          {rejected ? (
            <Badge variant="destructive">Not approved</Badge>
          ) : (
            <Badge variant="warning">Pending review</Badge>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-bold text-navy">
          {rejected ? "Account not approved" : "Your account is awaiting approval"}
        </h1>

        {rejected ? (
          <p className="mt-3 text-muted-foreground">
            This account is not approved for member access. If you believe this
            is a mistake, please contact the site owner.
          </p>
        ) : (
          <p className="mt-3 text-muted-foreground">
            Your email is verified. The first user from a new institution is
            reviewed manually to confirm medical affiliation. We&apos;ll email
            you when your account is approved.
          </p>
        )}

        {profile && (
          <dl className="mt-6 space-y-2 rounded-lg border border-border bg-background p-4 text-left text-sm">
            <Row label="Name" value={`${profile.fName} ${profile.lName}`} />
            <Row label="Email" value={profile.email} />
            <Row label="Institution" value={profile.institution_name} />
            <Row
              label="Email verified"
              value={emailVerified ? "Yes" : "Not yet"}
            />
          </dl>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/videos" className={buttonVariants({ variant: "outline" })}>
            Browse preview videos
          </Link>
          {user ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
              Back to sign in
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5 font-medium text-navy">
        {label === "Email verified" && value === "Yes" && (
          <CircleCheck className="size-4 text-members" />
        )}
        {value}
      </dd>
    </div>
  );
}
