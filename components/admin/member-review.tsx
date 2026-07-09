"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  Calendar,
  Check,
  X,
  CircleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { approveMember, rejectMember } from "@/app/(admin)/admin/actions";
import type { MembershipStatus, UserRole } from "@/lib/types";

export interface ReviewProfile {
  id: string;
  fName: string;
  lName: string;
  email: string;
  email_domain: string;
  institution_name: string;
  institution_country: string;
  membership_status: MembershipStatus;
  role: UserRole;
  created_at: string;
  domainTrusted: boolean;
}

function statusBadge(status: MembershipStatus) {
  if (status === "approved") return <Badge variant="success">Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MemberReview({ profiles }: { profiles: ReviewProfile[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    profiles.find((p) => p.membership_status === "pending")?.id ?? null
  );
  const [notes, setNotes] = useState("");
  const [trustDomain, setTrustDomain] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const selected = profiles.find((p) => p.id === selectedId) ?? null;

  async function onApprove() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setWarning(null);
    const result = await approveMember(selected.id, trustDomain, notes);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setNotes("");
    router.refresh();
  }

  async function onReject() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setWarning(null);
    const result = await rejectMember(selected.id, notes);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    if (result.warning) {
      setWarning(result.warning);
    }
    setNotes("");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Institution</th>
                <th className="px-4 py-3 font-semibold">Domain</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Requested</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No members yet.
                  </td>
                </tr>
              )}
              {profiles.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setError(null);
                  }}
                  className={`cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-secondary/50 ${
                    selectedId === p.id ? "bg-secondary/60" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{`${p.fName} ${p.lName}`}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.institution_name}
                    <span className="block text-xs">
                      {p.institution_country}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.email_domain}
                  </td>
                  <td className="px-4 py-3">{statusBadge(p.membership_status)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(p.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      <div className="rounded-xl border border-border bg-card p-5">
        {selected ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-navy text-sm font-semibold text-navy-foreground">
                {`${selected.fName[0] ?? ""}${selected.lName[0] ?? ""}`.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy">
                  {`${selected.fName} ${selected.lName}`}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {selected.email}
                </p>
              </div>
            </div>

            <InfoRow
              icon={<Building2 className="size-4" />}
              label="Institution"
              value={`${selected.institution_name} · ${selected.institution_country}`}
            />
            <InfoRow
              icon={<ShieldCheck className="size-4" />}
              label="Email domain"
              value={selected.email_domain}
              extra={
                selected.domainTrusted ? (
                  <Badge variant="success">Trusted</Badge>
                ) : (
                  <Badge variant="outline">New domain</Badge>
                )
              }
            />
            <InfoRow
              icon={<Calendar className="size-4" />}
              label="Requested"
              value={formatDate(selected.created_at)}
            />

            <div>
              <label
                htmlFor="notes"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Admin notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Add notes about this request…"
                className="mt-1.5 w-full rounded-lg border border-input bg-card p-3 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none"
              />
            </div>

            {selected.membership_status === "pending" && (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={trustDomain}
                  onChange={(e) => setTrustDomain(e.target.checked)}
                  className="size-4 rounded border-input accent-[color:var(--primary)]"
                />
                Trust <span className="font-medium">{selected.email_domain}</span>{" "}
                for automatic approval
              </label>
            )}

            {error && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {warning && (
              <Alert variant="warning">
                <CircleAlert />
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            )}

            {selected.membership_status !== "approved" && (
              <Button
                variant="primary"
                className="w-full bg-members hover:bg-members/90"
                onClick={onApprove}
                disabled={busy}
              >
                <Check className="size-4" />
                Approve Member
              </Button>
            )}
            {selected.membership_status !== "rejected" &&
              selected.role !== "admin" && (
                <Button
                  variant="outline"
                  className="w-full border-destructive/40 text-destructive hover:bg-destructive/8"
                  onClick={onReject}
                  disabled={busy}
                >
                  <X className="size-4" />
                  Reject Request
                </Button>
              )}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Select a member to review.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-navy">{value}</p>
          {extra}
        </div>
      </div>
    </div>
  );
}
