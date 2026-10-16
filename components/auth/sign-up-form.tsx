"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isValidEmail } from "@/lib/domains";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const fName = parts[0] ?? "";
  const lName = parts.slice(1).join(" ") || fName;
  return { fName, lName };
}

function RequiredAsterisk() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    institutionName: "",
    institutionCountry: "",
    institutionalEmail: "",
    password: "",
    confirmPassword: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { fName, lName } = splitFullName(form.fullName);
    const email = form.email.trim();
    const institutionName = form.institutionName.trim();
    const institutionCountry = form.institutionCountry.trim();
    const institutionalEmail = form.institutionalEmail.trim();

    if (!fName) {
      setError("Please enter your full name.");
      return;
    }
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (institutionalEmail && !isValidEmail(institutionalEmail)) {
      setError("Please enter a valid institutional email, or leave it blank.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
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
          email,
          password: form.password,
          institutionName,
          institutionCountry,
          institutionalEmail,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

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
        <Label htmlFor="fullName">
          Full name
          <RequiredAsterisk />
        </Label>
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
        <Label htmlFor="email">
          Email
          <RequiredAsterisk />
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@gmail.com"
        />
        <p id="email-help" className="text-xs text-muted-foreground">
          Personal email addresses such as Gmail, Yahoo, Outlook, and iCloud are
          accepted.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="institutionName">
          Affiliated institution name (if applicable)
        </Label>
        <Input
          id="institutionName"
          autoComplete="organization"
          value={form.institutionName}
          onChange={(e) => update("institutionName", e.target.value)}
          placeholder="e.g. Example University Hospital"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="institutionCountry">
          Affiliated institution country (if applicable)
        </Label>
        <Input
          id="institutionCountry"
          autoComplete="country-name"
          value={form.institutionCountry}
          onChange={(e) => update("institutionCountry", e.target.value)}
          placeholder="e.g. United States"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="institutionalEmail">
          Institutional email (if applicable)
        </Label>
        <Input
          id="institutionalEmail"
          type="email"
          autoComplete="off"
          value={form.institutionalEmail}
          onChange={(e) => update("institutionalEmail", e.target.value)}
          placeholder="name@yourinstitution.edu"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password
          <RequiredAsterisk />
        </Label>
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
        <Label htmlFor="confirmPassword">
          Confirm password
          <RequiredAsterisk />
        </Label>
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
