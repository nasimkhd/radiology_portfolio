"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

const REMEMBER_EMAIL_KEY = "rfs-remember-email";

export function SignInForm({
  next,
  authError,
}: {
  next?: string;
  authError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email: email.trim().toLowerCase(), password }
    );

    if (signInError) {
      if (/email not confirmed/i.test(signInError.message)) {
        router.push("/verify-email");
        return;
      }
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    const user = data.user;

    // Email first, then membership review.
    if (!user.email_confirmed_at) {
      router.push("/verify-email");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("membership_status, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.membership_status === "pending") {
      router.push("/pending-approval");
      return;
    }
    if (profile.membership_status === "rejected") {
      router.push("/pending-approval?status=rejected");
      return;
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim().toLowerCase());
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    const destination =
      next ?? (profile.role === "admin" ? "/admin" : "/dashboard/videos");
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
        />
      </div>

      {(authError || error) && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{error ?? authError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            key={showPassword ? "password-visible" : "password-hidden"}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={showPassword ? "off" : "current-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="size-4 rounded border-input text-primary accent-primary"
        />
        <span className="text-sm text-foreground/80">Remember me</span>
      </label>

      <Button
        type="submit"
        variant="navy"
        className="w-full"
        size="lg"
        disabled={submitting}
      >
        {submitting ? "Signing in…" : "Sign In"}
      </Button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need access?{" "}
        <Link href="/sign-up" className="font-semibold text-primary hover:underline">
          Request member access
        </Link>
      </p>
    </form>
  );
}
