export type MembershipStatus = "pending" | "approved" | "rejected";
export type UserRole = "member" | "admin";
export type AccessLevel = "public" | "members";
export type VideoStatus = "draft" | "published" | "archived";
export type TrustSource = "admin_review" | "manual_seed" | "manual_admin";

export interface Profile {
  id: string;
  fName: string;
  lName: string;
  email: string;
  email_domain: string;
  institution_name: string;
  institution_country: string;
  membership_status: MembershipStatus;
  role: UserRole;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AllowedEmailDomain {
  id: string;
  domain: string;
  organization_name: string;
  auto_approve: boolean;
  trust_source: TrustSource;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string | null;
  thumbnail_url: string | null;
  access_level: AccessLevel;
  status: VideoStatus;
  display_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoAccessEvent {
  id: string;
  profile_id: string | null;
  video_id: string | null;
  event_type: "redirect";
  created_at: string;
}

/**
 * Safe, browser-facing shape of a catalog video. Never includes `youtube_url`.
 * `watchPath` is only populated for videos the current viewer may open.
 */
export interface CatalogVideo {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  accessLevel: AccessLevel;
  category: string | null;
  categorySlug: string | null;
  locked: boolean;
  watchPath: string | null;
}
