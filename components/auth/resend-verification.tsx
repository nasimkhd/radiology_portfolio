"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/env";

export function ResendVerification({ email }: { email: string | null }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function resend() {
    if (!email) return;
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={resend}
        disabled={!email || status === "sending" || status === "sent"}
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Verification email sent"
            : "Resend verification email"}
      </Button>
      {status === "error" && (
        <p className="text-center text-xs text-destructive">
          Could not resend right now. Please try again shortly.
        </p>
      )}
    </div>
  );
}
