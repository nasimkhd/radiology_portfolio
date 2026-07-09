import type { Metadata } from "next";
import { MemberReview, type ReviewProfile } from "@/components/admin/member-review";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Member Review" };

async function getData(): Promise<ReviewProfile[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createAdminClient();

  const [{ data: profiles }, { data: domains }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, fName, lName, email, email_domain, institution_name, institution_country, membership_status, role, created_at"
      )
      .order("created_at", { ascending: false }),
    supabase.from("allowed_email_domains").select("domain"),
  ]);

  const trusted = new Set((domains ?? []).map((d) => d.domain));

  return ((profiles ?? []) as Profile[]).map((p) => ({
    id: p.id,
    fName: p.fName,
    lName: p.lName,
    email: p.email,
    email_domain: p.email_domain,
    institution_name: p.institution_name,
    institution_country: p.institution_country,
    membership_status: p.membership_status,
    role: p.role,
    created_at: p.created_at,
    domainTrusted: trusted.has(p.email_domain),
  }));
}

export default async function MembersPage() {
  const profiles = await getData();
  const pendingCount = profiles.filter(
    (p) => p.membership_status === "pending"
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-navy">
        Member Review
      </h1>
      <p className="mt-1 text-muted-foreground">
        Approve verified medical-affiliation requests. {pendingCount} pending.
      </p>

      <div className="mt-8">
        <MemberReview profiles={profiles} />
      </div>
    </div>
  );
}
