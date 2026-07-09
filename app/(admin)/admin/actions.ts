"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isPersonalEmailDomain,
  isValidSlug,
  normalizeDomain,
  slugify,
} from "@/lib/domains";
import {
  sendMembershipApprovedEmail,
  sendMembershipRejectedEmail,
} from "@/lib/email";
import { extractYouTubeId, isValidYouTubeUrl } from "@/lib/youtube";

export interface ActionResult {
  ok: boolean;
  error?: string;
  warning?: string;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

async function upsertTrustedDomain(
  supabase: ReturnType<typeof createAdminClient>,
  {
    domain,
    organizationName,
    adminId,
    trustSource,
  }: {
    domain: string;
    organizationName: string;
    adminId: string | null;
    trustSource: "admin_review" | "manual_admin";
  }
): Promise<ActionResult> {
  if (!domain || isPersonalEmailDomain(domain)) {
    return { ok: true };
  }

  const { error } = await supabase.from("allowed_email_domains").upsert(
    {
      domain,
      organization_name: organizationName,
      auto_approve: true,
      trust_source: trustSource,
      created_by: adminId,
    },
    { onConflict: "domain" }
  );

  if (error) return { ok: false, error: "Could not save the trusted domain." };
  return { ok: true };
}

/** Backfill trusted domains from already-approved members (idempotent). */
export async function syncDomainsFromApprovedMembers(): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("email_domain, institution_name")
    .eq("membership_status", "approved");

  const byDomain = new Map<string, string>();
  for (const profile of profiles ?? []) {
    if (!profile.email_domain || isPersonalEmailDomain(profile.email_domain)) {
      continue;
    }
    if (!byDomain.has(profile.email_domain)) {
      byDomain.set(profile.email_domain, profile.institution_name);
    }
  }

  if (byDomain.size === 0) return;

  const rows = [...byDomain.entries()].map(([domain, organization_name]) => ({
    domain,
    organization_name,
    auto_approve: true,
    trust_source: "admin_review" as const,
  }));

  await supabase.from("allowed_email_domains").upsert(rows, {
    onConflict: "domain",
    ignoreDuplicates: true,
  });
}

export async function approveMember(
  profileId: string,
  notes?: string
): Promise<ActionResult> {
  const { profile: admin } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: target, error: loadError } = await supabase
    .from("profiles")
    .select("id, email, fName, email_domain, institution_name")
    .eq("id", profileId)
    .maybeSingle();

  if (loadError || !target) return { ok: false, error: "Member not found." };

  const { error } = await supabase
    .from("profiles")
    .update({
      membership_status: "approved",
      reviewed_by: admin?.id ?? null,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq("id", profileId);

  if (error) return { ok: false, error: "Could not approve member." };

  const domainResult = await upsertTrustedDomain(supabase, {
    domain: target.email_domain,
    organizationName: target.institution_name || target.email_domain,
    adminId: admin?.id ?? null,
    trustSource: "admin_review",
  });

  if (!domainResult.ok) {
    return domainResult;
  }

  const emailResult = await sendMembershipApprovedEmail({
    to: target.email,
    firstName: target.fName,
  });

  revalidatePath("/admin/members");
  revalidatePath("/admin/domains");
  revalidatePath("/admin");

  if (!emailResult.ok) {
    return {
      ok: true,
      warning:
        "Member was approved, but the notification email could not be sent. They can still sign in once approved.",
    };
  }

  return { ok: true };
}

export async function rejectMember(
  profileId: string,
  notes?: string
): Promise<ActionResult> {
  const { profile: admin } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: target, error: loadError } = await supabase
    .from("profiles")
    .select("id, email, fName, role")
    .eq("id", profileId)
    .maybeSingle();

  if (loadError || !target) return { ok: false, error: "Member not found." };
  if (target.role === "admin") {
    return { ok: false, error: "Admin accounts cannot be rejected." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      membership_status: "rejected",
      reviewed_by: admin?.id ?? null,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq("id", profileId);

  if (error) return { ok: false, error: "Could not reject member." };

  const emailResult = await sendMembershipRejectedEmail({
    to: target.email,
    firstName: target.fName,
    reviewNotes: notes,
  });

  revalidatePath("/admin/members");
  revalidatePath("/admin");

  if (!emailResult.ok) {
    return {
      ok: true,
      warning:
        "Member was rejected, but the notification email could not be sent. They will still see the rejection when they sign in.",
    };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Allowed domains
// ---------------------------------------------------------------------------

export async function addDomain(formData: FormData): Promise<ActionResult> {
  const { profile: admin } = await requireAdmin();
  const supabase = createAdminClient();

  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const autoApprove = formData.get("autoApprove") === "on";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!domain || !organizationName) {
    return { ok: false, error: "Domain and organization name are required." };
  }
  if (isPersonalEmailDomain(domain)) {
    return { ok: false, error: "Personal email domains cannot be trusted." };
  }

  const { error } = await supabase.from("allowed_email_domains").upsert(
    {
      domain,
      organization_name: organizationName,
      auto_approve: autoApprove,
      trust_source: "manual_admin",
      notes: notes || null,
      created_by: admin?.id ?? null,
    },
    { onConflict: "domain" }
  );

  if (error) return { ok: false, error: "Could not save the domain." };

  revalidatePath("/admin/domains");
  return { ok: true };
}

export async function deleteDomain(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("allowed_email_domains")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: "Could not remove the domain." };
  revalidatePath("/admin/domains");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

function parseVideoForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const accessLevel = String(formData.get("accessLevel") ?? "members");
  const status = String(formData.get("status") ?? "draft");
  const displayOrder = Number(formData.get("displayOrder") ?? 0);

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  return {
    title,
    slug,
    description,
    youtubeUrl,
    thumbnailUrl,
    categoryId,
    accessLevel,
    status,
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
  };
}

function validateVideo(input: ReturnType<typeof parseVideoForm>): string | null {
  if (!input.title) return "Title is required.";
  if (!input.description) return "Description is required.";
  if (!isValidSlug(input.slug)) return "Slug must be lowercase and URL-safe.";
  if (!isValidYouTubeUrl(input.youtubeUrl)) {
    return "YouTube URL must start with https://www.youtube.com/ or https://youtu.be/.";
  }
  if (!["public", "members"].includes(input.accessLevel)) {
    return "Invalid access level.";
  }
  if (!["draft", "published", "archived"].includes(input.status)) {
    return "Invalid status.";
  }
  return null;
}

export async function createVideo(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const input = parseVideoForm(formData);
  const validationError = validateVideo(input);
  if (validationError) return { ok: false, error: validationError };

  const youtubeVideoId = extractYouTubeId(input.youtubeUrl);

  const { error } = await supabase.from("videos").insert({
    title: input.title,
    slug: input.slug,
    description: input.description,
    youtube_url: input.youtubeUrl,
    youtube_video_id: youtubeVideoId,
    thumbnail_url: input.thumbnailUrl || null,
    category_id: input.categoryId || null,
    access_level: input.accessLevel,
    status: input.status,
    display_order: input.displayOrder,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Slug already exists." };
    return { ok: false, error: "Could not create the video." };
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  return { ok: true };
}

export async function updateVideo(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const input = parseVideoForm(formData);
  const validationError = validateVideo(input);
  if (validationError) return { ok: false, error: validationError };

  const youtubeVideoId = extractYouTubeId(input.youtubeUrl);

  const { data: existing } = await supabase
    .from("videos")
    .select("status, published_at")
    .eq("id", id)
    .maybeSingle();

  const publishedAt =
    input.status === "published"
      ? existing?.published_at ?? new Date().toISOString()
      : null;

  const { error } = await supabase
    .from("videos")
    .update({
      title: input.title,
      slug: input.slug,
      description: input.description,
      youtube_url: input.youtubeUrl,
      youtube_video_id: youtubeVideoId,
      thumbnail_url: input.thumbnailUrl || null,
      category_id: input.categoryId || null,
      access_level: input.accessLevel,
      status: input.status,
      display_order: input.displayOrder,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Slug already exists." };
    return { ok: false, error: "Could not update the video." };
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  return { ok: true };
}

export async function setVideoStatus(
  id: string,
  status: "draft" | "published" | "archived"
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("videos")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Could not update status." };

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  return { ok: true };
}

export async function deleteVideo(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return { ok: false, error: "Could not delete the video." };
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  return { ok: true };
}
