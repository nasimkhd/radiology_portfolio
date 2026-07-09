import type { Metadata } from "next";
import { syncDomainsFromApprovedMembers } from "@/app/(admin)/admin/actions";
import { DomainManager } from "@/components/admin/domain-manager";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { AllowedEmailDomain } from "@/lib/types";

export const metadata: Metadata = { title: "Allowed Domains" };

async function getDomains(): Promise<AllowedEmailDomain[]> {
  if (!isSupabaseConfigured) return [];
  await syncDomainsFromApprovedMembers();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("allowed_email_domains")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as AllowedEmailDomain[]) ?? [];
}

export default async function DomainsPage() {
  const domains = await getDomains();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-navy">
        Allowed Email Domains
      </h1>
      <p className="mt-1 text-muted-foreground">
        Trusted institutional domains. Signups from these domains can be
        approved automatically (email verification still required).
      </p>

      <div className="mt-8">
        <DomainManager domains={domains} />
      </div>
    </div>
  );
}
