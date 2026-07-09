import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL, allowPersonalEmailSignup, isSupabaseConfigured } from "@/lib/env";
import {
  getEmailDomain,
  isPersonalEmailDomain,
  isValidEmail,
  normalizeEmail,
} from "@/lib/domains";

interface SignUpBody {
  fName?: string;
  lName?: string;
  email?: string;
  password?: string;
  institutionName?: string;
  institutionCountry?: string;
}

const PERSONAL_DOMAIN_MESSAGE =
  "Please use your hospital, university, or medical institution email address.";

function authSignUpErrorMessage(error: {
  message?: string;
  status?: number;
  code?: string;
}): string {
  const raw = error.message?.trim();
  const looksEmpty = !raw || raw === "{}";

  // Supabase often returns unexpected_failure (or an empty AuthError) when
  // confirmation email delivery fails — usually misconfigured custom SMTP.
  if (
    error.code === "unexpected_failure" ||
    (looksEmpty && (error.status === 500 || error.status === 400))
  ) {
    return "We could not send the verification email. Check Supabase Auth SMTP settings (e.g. Resend) and try again.";
  }

  if (!looksEmpty) return raw;

  return "Could not create your account. Please try again.";
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Sign up is not available yet. Supabase is not configured." },
      { status: 503 }
    );
  }

  let body: SignUpBody;
  try {
    body = (await request.json()) as SignUpBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fName = body.fName?.trim() ?? "";
  const lName = body.lName?.trim() ?? "";
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  const institutionName = body.institutionName?.trim() ?? "";
  const institutionCountry = body.institutionCountry?.trim() ?? "";

  // 1. Validate required fields.
  if (
    !fName ||
    !lName ||
    !email ||
    !password ||
    !institutionName ||
    !institutionCountry
  ) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  // 2. Domain policy.
  const domain = getEmailDomain(email);
  if (!domain) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (!allowPersonalEmailSignup && isPersonalEmailDomain(domain)) {
    return NextResponse.json({ error: PERSONAL_DOMAIN_MESSAGE }, { status: 400 });
  }

  const admin = createAdminClient();

  // 3. Check the learned trusted-domain dictionary.
  const { data: trusted } = await admin
    .from("allowed_email_domains")
    .select("domain, auto_approve")
    .eq("domain", domain)
    .maybeSingle();

  const membershipStatus =
    trusted && trusted.auto_approve ? "approved" : "pending";

  // 4. Create the Supabase Auth user (sends a verification email).
  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback`,
      data: { fName, lName },
    },
  });

  if (signUpError) {
    const status = signUpError.status === 422 ? 409 : 400;
    const message =
      status === 409
        ? "An account with this email already exists. Try signing in instead."
        : authSignUpErrorMessage(signUpError);
    console.error(
      "Signup auth error:",
      JSON.stringify({
        name: signUpError.name,
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code,
      })
    );
    return NextResponse.json({ error: message }, { status });
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Could not create the account. Please try again." },
      { status: 500 }
    );
  }

  // 5. Create the profile row with the service-role client (bypasses RLS).
  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    fName,
    lName,
    email,
    email_domain: domain,
    institution_name: institutionName,
    institution_country: institutionCountry,
    membership_status: membershipStatus,
    role: "member",
  });

  // 6. Recovery: if profile creation fails, delete the just-created Auth user.
  if (profileError) {
    // Ignore duplicate profile (user retried) — treat as success.
    if (profileError.code === "23505") {
      return NextResponse.json({
        status: "created",
        membershipStatus,
        message: "Account created. Please verify your email.",
      });
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      // Log the orphaned auth user id (no secrets) for manual cleanup.
      console.error(
        `Signup profile insert failed and auth user cleanup failed. Orphaned auth user id: ${userId}`,
        profileError.message
      );
      return NextResponse.json(
        {
          error:
            "We could not finish creating your account. Please contact support or try again later.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Could not create your profile. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "created",
    membershipStatus,
    message: "Account created. Please verify your email.",
  });
}
