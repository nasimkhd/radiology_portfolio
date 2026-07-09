"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isPersonalEmailDomain, getEmailDomain } from "@/lib/domains";

const PERSONAL_DOMAIN_MESSAGE =
  "Please use your hospital, university, or medical institution email address.";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const fName = parts[0] ?? "";
  const lName = parts.slice(1).join(" ") || fName;
  return { fName, lName };
}

export function SignUpForm({
  allowPersonalEmail = false,
}: {
  allowPersonalEmail?: boolean;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    institutionName: "",
    institutionCountry: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const emailDomain = getEmailDomain(form.email);
  const personalDomainWarning =
    !allowPersonalEmail &&
    emailDomain.length > 0 &&
    isPersonalEmailDomain(emailDomain);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { fName, lName } = splitFullName(form.fullName);
    const institutionName = form.institutionName.trim();
    const institutionCountry = form.institutionCountry.trim();

    if (!fName) {
      setError("Please enter your full name.");
      return;
    }
    if (!institutionName) {
      setError("Please enter your affiliated institution name.");
      return;
    }
    if (!institutionCountry) {
      setError("Please enter your affiliated institution country.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (personalDomainWarning) {
      setError(PERSONAL_DOMAIN_MESSAGE);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fName,
          lName,
          email: form.email,
          password: form.password,
          institutionName,
          institutionCountry,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Always verify email first; pending/approved routing happens after confirm.
      router.push("/verify-email");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          required
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="institutionName">Affiliated institution name</Label>
        <Input
          id="institutionName"
          autoComplete="organization"
          required
          value={form.institutionName}
          onChange={(e) => update("institutionName", e.target.value)}
          placeholder="e.g. Example University Hospital"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="institutionCountry">Affiliated institution country</Label>
        <Input
          id="institutionCountry"
          autoComplete="country-name"
          required
          value={form.institutionCountry}
          onChange={(e) => update("institutionCountry", e.target.value)}
          placeholder="e.g. United States"
        />
        <p className="text-xs text-muted-foreground">
          Required for admin review when your email domain is new to the site.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Institutional email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="name@yourinstitution.edu"
          aria-invalid={personalDomainWarning}
          aria-describedby={personalDomainWarning ? "email-warning" : "email-help"}
        />
        <p id="email-help" className="text-xs text-muted-foreground">
          Use your hospital, university, medical school, or health-system email
          address. Personal email addresses such as Gmail, Yahoo, Outlook, and
          iCloud are not eligible.
        </p>
        {personalDomainWarning && (
          <div
            id="email-warning"
            className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{PERSONAL_DOMAIN_MESSAGE}</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            key={showPassword ? "password-visible" : "password-hidden"}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={showPassword ? "off" : "new-password"}
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Create a password"
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
        <p className="text-xs text-muted-foreground">
          Minimum 8 characters with a number and a letter.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <Input
            key={showConfirmPassword ? "confirm-visible" : "confirm-hidden"}
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete={showConfirmPassword ? "off" : "new-password"}
            required
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            placeholder="Confirm your password"
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        <UserPlus className="size-4" />
        {submitting ? "Creating account…" : "Create Account"}
      </Button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
