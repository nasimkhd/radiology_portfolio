"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addDomain, deleteDomain } from "@/app/(admin)/admin/actions";
import type { AllowedEmailDomain } from "@/lib/types";

export function DomainManager({ domains }: { domains: AllowedEmailDomain[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAdd(formData: FormData) {
    setBusy(true);
    setError(null);
    const result = await addDomain(formData);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not add domain.");
      return;
    }
    router.refresh();
    (document.getElementById("add-domain-form") as HTMLFormElement)?.reset();
  }

  async function onDelete(id: string) {
    setBusy(true);
    await deleteDomain(id);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Domain</th>
                <th className="px-4 py-3 font-semibold">Organization</th>
                <th className="px-4 py-3 font-semibold">Auto-approve</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {domains.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No trusted domains yet.
                  </td>
                </tr>
              )}
              {domains.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-navy">{d.domain}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.organization_name}
                  </td>
                  <td className="px-4 py-3">
                    {d.auto_approve ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(d.id)}
                      disabled={busy}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${d.domain}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add form */}
      <Card className="h-fit p-5">
        <h2 className="font-semibold text-navy">Add trusted domain</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Future signups from this domain can be approved automatically.
        </p>
        <form id="add-domain-form" action={onAdd} className="mt-4 space-y-4">
          {error && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              name="domain"
              required
              placeholder="examplehospital.org"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organizationName">Organization name</Label>
            <Input
              id="organizationName"
              name="organizationName"
              required
              placeholder="Example Hospital"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Trusted after admin review."
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="autoApprove"
              defaultChecked
              className="size-4 rounded border-input accent-[color:var(--primary)]"
            />
            Auto-approve future users from this domain
          </label>
          <Button type="submit" className="w-full" disabled={busy}>
            <Plus className="size-4" />
            {busy ? "Saving…" : "Add domain"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
