import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Users, CircleX, ShieldCheck, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getStats() {
  if (!isSupabaseConfigured) return null;
  const supabase = createAdminClient();

  const [pending, approved, rejected, domains, videos] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("membership_status", "pending"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("membership_status", "approved"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("membership_status", "rejected"),
    supabase
      .from("allowed_email_domains")
      .select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }),
  ]);

  return {
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
    domains: domains.count ?? 0,
    videos: videos.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-navy">
        Admin Dashboard
      </h1>
      <p className="mt-1 text-muted-foreground">
        Manage the catalog, review members, and maintain trusted domains.
      </p>

      {stats ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Clock className="size-5" />}
            tone="amber"
            value={stats.pending}
            label="Pending review"
          />
          <StatCard
            icon={<Users className="size-5" />}
            tone="members"
            value={stats.approved}
            label="Approved members"
          />
          <StatCard
            icon={<CircleX className="size-5" />}
            tone="destructive"
            value={stats.rejected}
            label="Rejected"
          />
          <StatCard
            icon={<ShieldCheck className="size-5" />}
            tone="primary"
            value={stats.domains}
            label="Trusted domains"
          />
        </div>
      ) : (
        <Card className="mt-8 p-6 text-sm text-muted-foreground">
          Connect Supabase to see live stats.
        </Card>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between p-6">
          <div>
            <h2 className="font-semibold text-navy">Review members</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats?.pending ?? 0} awaiting approval
            </p>
          </div>
          <Link href="/admin/members" className={buttonVariants({ size: "sm" })}>
            Review
          </Link>
        </Card>
        <Card className="flex items-center justify-between p-6">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-navy">
              <Video className="size-4" /> Manage videos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats?.videos ?? 0} videos in the catalog
            </p>
          </div>
          <Link
            href="/admin/videos"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Manage
          </Link>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: "amber" | "members" | "destructive" | "primary";
}) {
  const tones: Record<typeof tone, string> = {
    amber: "bg-amber-100 text-amber-700",
    members: "bg-members/12 text-members",
    destructive: "bg-destructive/10 text-destructive",
    primary: "bg-primary/10 text-primary",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-10 items-center justify-center rounded-full ${tones[tone]}`}
        >
          {icon}
        </span>
        <span className="text-3xl font-bold text-navy">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </Card>
  );
}
