"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleAlert, MailCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/env";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${SITE_URL}/auth/recovery` }
    );
    if (resetError) {
      setError("Could not send the reset email. Please try again.");
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full p-8">
        {status === "sent" ? (
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent">
              <MailCheck className="size-7 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-navy">Check your email</h1>
            <p className="mt-2 text-muted-foreground">
              If an account exists for {email}, we&apos;ve sent a password reset
              link.
            </p>
            <Link
              href="/sign-in"
              className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-navy">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              {error && (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send reset link"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
