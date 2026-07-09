"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setSessionError(
          "This reset link is invalid or has expired. Request a new link below."
        );
      }
      setCheckingSession(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(
        "Could not update your password. The reset link may have expired."
      );
      setSubmitting(false);
      return;
    }
    router.push("/dashboard/videos");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-bold text-navy">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {(sessionError || error) && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{sessionError ?? error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || checkingSession || Boolean(sessionError)}
          >
            {submitting ? "Updating…" : "Update password"}
          </Button>
          {sessionError && (
            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/forgot-password"
                className="font-semibold text-primary hover:underline"
              >
                Request a new reset link
              </Link>
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
