import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL, isSupabaseConfigured } from "@/lib/env";
import { getEmailDomain, isValidEmail, normalizeEmail } from "@/lib/domains";

interface SignUpBody {
  fName?: string;
  lName?: string;
  email?: string;
  password?: string;
  institutionName?: string;
  institutionCountry?: string;
  institutionalEmail?: string;
}

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
  const institutionalEmail = body.institutionalEmail
    ? normalizeEmail(body.institutionalEmail)
    : "";

  // 1. Validate required fields.
  if (!fName || !lName || !email || !password) {
    return NextResponse.json(
      { error: "Full name, email, and password are required." },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (institutionalEmail && !isValidEmail(institutionalEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid institutional email, or leave it blank." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const domain = getEmailDomain(email);
  if (!domain) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const membershipStatus = "approved";

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
  const profileRow = {
    id: userId,
    fName,
    lName,
    email,
    email_domain: domain,
    institution_name: institutionName,
    institution_country: institutionCountry,
    institutional_email: institutionalEmail || null,
    membership_status: membershipStatus,
    role: "member",
  };

  let { error: profileError } = await admin.from("profiles").insert(profileRow);

  // Column may not exist until 0002 is applied; retry without it.
  if (profileError?.code === "42703") {
    const { institutional_email: _ignored, ...legacyRow } = profileRow;
    ({ error: profileError } = await admin.from("profiles").insert(legacyRow));
  }

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
