import "server-only";
import { Resend } from "resend";
import {
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  SITE_CONTACT_EMAIL,
  SITE_URL,
} from "@/lib/env";

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY && RESEND_FROM_EMAIL);
}

function contactInstructions(): string {
  return SITE_CONTACT_EMAIL
    ? `If you believe this is a mistake, please contact us at ${SITE_CONTACT_EMAIL}.`
    : "If you believe this is a mistake, please contact the site owner.";
}

export async function sendMembershipApprovedEmail(params: {
  to: string;
  firstName: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured." };
  }

  const resend = new Resend(RESEND_API_KEY);
  const signInUrl = `${SITE_URL}/sign-in`;

  const text = [
    `Hi ${params.firstName},`,
    "",
    "Good news — your membership request for Radio From Scratch was approved.",
    "",
    `Sign in to access the full video library: ${signInUrl}`,
    "",
    "— Radio From Scratch",
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(params.firstName)},</p>
    <p>Good news — your membership request for <strong>Radio From Scratch</strong> was <strong>approved</strong>.</p>
    <p>You can now sign in and access the full video library.</p>
    <p style="margin:24px 0;">
      <a href="${escapeHtml(signInUrl)}" style="display:inline-block;padding:12px 20px;background:#0f2744;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
        Sign in
      </a>
    </p>
    <p style="color:#64748b;font-size:14px;">— Radio From Scratch</p>
  `.trim();

  const { error } = await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: params.to,
    ...(SITE_CONTACT_EMAIL ? { replyTo: SITE_CONTACT_EMAIL } : {}),
    subject: "Your membership was approved — Radio From Scratch",
    text,
    html,
  });

  if (error) {
    console.error("Failed to send approval email:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function sendMembershipRejectedEmail(params: {
  to: string;
  firstName: string;
  reviewNotes?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured." };
  }

  const resend = new Resend(RESEND_API_KEY);
  const notes = params.reviewNotes?.trim();
  const contactLine = contactInstructions();

  const text = [
    `Hi ${params.firstName},`,
    "",
    "Thank you for requesting access to Radio From Scratch.",
    "After review, your membership request was not approved.",
    "",
    `You can still browse public preview videos at ${SITE_URL}/videos.`,
    ...(notes ? ["", "Note from the review team:", notes] : []),
    "",
    contactLine,
    "",
    "— Radio From Scratch",
  ].join("\n");

  const notesHtml = notes
    ? `<p style="margin:16px 0 0;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;"><strong>Note from the review team</strong><br>${escapeHtml(notes).replace(/\n/g, "<br>")}</p>`
    : "";

  const html = `
    <p>Hi ${escapeHtml(params.firstName)},</p>
    <p>Thank you for requesting access to <strong>Radio From Scratch</strong>.</p>
    <p>After review, your membership request was <strong>not approved</strong>.</p>
    <p>You can still browse public preview videos on the site.</p>
    ${notesHtml}
    <p style="margin-top:24px;">${escapeHtml(contactLine)}</p>
    <p style="color:#64748b;font-size:14px;">— Radio From Scratch</p>
  `.trim();

  const { error } = await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: params.to,
    ...(SITE_CONTACT_EMAIL ? { replyTo: SITE_CONTACT_EMAIL } : {}),
    subject: "Your membership request was not approved",
    text,
    html,
  });

  if (error) {
    console.error("Failed to send rejection email:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
