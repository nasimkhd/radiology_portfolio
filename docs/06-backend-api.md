# Backend API

## Backend Approach

Use Next.js Route Handlers and Server Actions inside the same application. A separate backend service is not needed for the first version.

The backend is responsible for:

- Enforcing signup domain rules.
- Creating pending profiles for new institutional domains.
- Learning trusted domains when admins approve members.
- Reading the current Supabase session.
- Checking profile approval status and Supabase email verification.
- Returning safe video metadata for catalog pages.
- Redirecting allowed users to YouTube.
- Protecting admin-only mutations.

## Server-Side Clients

Create three Supabase client helpers during implementation:

| Helper | Used In | Purpose |
| --- | --- | --- |
| `lib/supabase/server.ts` | Server components, server actions, route handlers | Session-aware queries using the user's auth context |
| `lib/supabase/client.ts` | Client components | Browser auth state and client-side interactions |
| `lib/supabase/admin.ts` | Server-only route handlers/actions | Service-role operations such as creating profiles or admin updates |

The admin client must be server-only and must never be imported into files with `"use client"`.

## Access Helpers

Implement shared server helpers:

```text
getCurrentProfile()
requireApprovedMember()
requireAdmin()
requireVerifiedEmail()
getEmailDomain(email)
isPersonalEmailDomain(domain)
checkAllowedEmailDomain(domain)
trustEmailDomainFromApprovedMember(profileId)
```

These helpers keep page loaders and route handlers consistent. `requireApprovedMember()` should require both `membership_status = approved` and a verified Supabase Auth email before granting member access.

## Route Summary

| Route | Method | Access | Purpose |
| --- | --- | --- | --- |
| `/api/auth/sign-up` | `POST` | Public | Validate medical domain and create user/profile |
| `/api/videos` | `GET` | Public/member | Return visible videos for current user |
| `/watch/[slug]` | `GET` | Public/member | Check access and redirect to YouTube |
| `/api/admin/videos` | `POST` | Admin | Create video |
| `/api/admin/videos/[id]` | `PATCH` | Admin | Update video |
| `/api/admin/videos/[id]` | `DELETE` | Admin | Archive or delete video |
| `/api/admin/domains` | `POST` | Admin | Add allowed email domain |
| `/api/admin/members/[id]` | `PATCH` | Admin | Approve or reject member |

Some of these can be implemented as Server Actions instead of JSON APIs. Route Handlers are clearer for signup and redirects.

## Signup Route

Route: `/api/auth/sign-up`

Method: `POST`

Request body:

```json
{
  "fName": "Jane",
  "lName": "Doe",
  "email": "jane@examplehospital.org",
  "password": "secure-password",
  "institutionName": "Example Hospital",
  "institutionCountry": "United States"
}
```

Server flow:

1. Validate required fields.
2. Normalize email to lowercase.
3. Extract domain.
4. Reject personal domains.
5. Query `allowed_email_domains`.
6. Create Supabase Auth user.
7. Create `profiles` row with `fName`, `lName`, `email`, `email_domain`, `institution_name`, `institution_country`, and `membership_status = approved` if the domain is trusted.
8. Create `profiles` row with `membership_status = pending` if the domain is not trusted yet.
9. If profile creation fails after Auth user creation, delete the just-created Auth user with the server-only admin client when possible, then return a clear retry/contact-support error.
10. Return success response.

Success response:

```json
{
  "status": "created",
  "membershipStatus": "pending",
  "message": "Account created. Please verify your email."
}
```

If the domain already exists in `allowed_email_domains`, return `"membershipStatus": "approved"`. If the domain is new but not a personal domain, return `"membershipStatus": "pending"`.

An approved signup still cannot access member videos until the Supabase Auth email is verified.

Rejected response:

```json
{
  "error": "Please use your hospital, university, or medical institution email address."
}
```

Important: do not create an approved profile for a new domain. Unknown institutional domains should create pending profiles, while obvious personal domains should be rejected before creating a profile.

Recovery behavior:

- If Supabase Auth user creation fails, return an error and do not create a profile.
- If Supabase Auth user creation succeeds but profile creation fails, attempt to delete the new Auth user immediately.
- If cleanup fails, log the orphaned Auth user ID without logging passwords or tokens.
- On sign-in, a user without a profile should be sent to account recovery or have a missing pending profile recreated server-side after revalidating the email domain and institution details.

## Video Listing

Route: `/api/videos`

Method: `GET`

The response depends on the current user:

- Public or pending user: return safe metadata for all `status = published` videos, including locked member-only cards, but do not include `youtubeUrl` and do not provide a playable redirect URL for member-only videos.
- Approved member with verified email: return all `status = published` videos with CTAs pointing to `/watch/[slug]`.
- Admin: optionally include drafts in admin routes only.

Because `youtube_url` is stored on the `videos` table, public locked-card metadata for member-only videos should be assembled server-side. Do not let an anonymous browser Supabase client query member-only video rows directly. The route should select or map only safe fields before returning JSON.

Public response example:

```json
{
  "videos": [
    {
      "title": "Chest X-Ray Basics",
      "slug": "chest-xray-basics",
      "description": "A short introduction to systematic chest radiograph review.",
      "thumbnailUrl": "https://img.youtube.com/vi/example/hqdefault.jpg",
      "accessLevel": "public",
      "category": "Chest Imaging",
      "locked": false,
      "watchPath": "/watch/chest-xray-basics"
    },
    {
      "title": "Advanced CT Pattern Review",
      "slug": "advanced-ct-pattern-review",
      "description": "A members-only lesson preview description.",
      "thumbnailUrl": "https://img.youtube.com/vi/example2/hqdefault.jpg",
      "accessLevel": "members",
      "category": "Emergency Radiology",
      "locked": true,
      "watchPath": null
    }
  ]
}
```

Do not include `youtubeUrl` in catalog responses. The final YouTube URL should only be read and revealed inside `/watch/[slug]` after the redirect route checks access.

## YouTube Redirect Route

Route: `/watch/[slug]`

Method: `GET`

Server flow:

1. Load the video by slug.
2. Confirm `status = published`.
3. If `access_level = public`, allow redirect.
4. If `access_level = members`, require an approved profile and verified email.
5. Optionally insert a `video_access_events` row.
6. Return a `302` redirect to `youtube_url`.

Failure behavior:

- Missing video: show 404.
- Draft or archived video: show 404.
- Member-only video for public user: redirect to `/sign-in?next=/watch/[slug]`.
- Member-only video for pending user: redirect to `/pending-approval`.
- Member-only video for approved but unverified user: show email verification instructions.
- Member-only video for rejected user: show access denied.

This route is the safest place to reveal the final YouTube URL.

## Admin Video Management

Admin create/update should validate:

- Title is present.
- Slug is unique and URL-safe.
- YouTube URL is valid.
- Access level is `public` or `members`.
- Status is `draft`, `published`, or `archived`.
- Display order is a number.

Recommended publish workflow:

1. Add video as draft.
2. Preview video card in admin UI.
3. Mark as public or members.
4. Publish.

This prevents incomplete videos from appearing publicly.

## Admin Domain Management

Admin domain route should:

1. Normalize domain to lowercase.
2. Remove leading `@` if entered.
3. Reject personal domains.
4. Insert or update `allowed_email_domains`.

Example admin domain body:

```json
{
  "domain": "examplehospital.org",
  "organizationName": "Example Hospital",
  "autoApprove": true,
  "notes": "Trusted after admin review."
}
```

## Admin Member Review

Admin member route can update:

- `membership_status`
- `role`
- `institution_name`
- `institution_country`
- `review_notes`
- `reviewed_by`
- `reviewed_at`
- `allowed_email_domains`, when approving a pending member and choosing to trust the member's domain

Recommended approval flow:

1. Load the pending profile.
2. Review the user's institution name, institution country, email domain, and any notes.
3. If approving the user, set `membership_status = approved`, `reviewed_by`, and `reviewed_at`.
4. If rejecting the user, set `membership_status = rejected`, `reviewed_by`, `reviewed_at`, and optional `review_notes`.
5. If the admin chooses to trust the domain, insert the profile's `email_domain` into `allowed_email_domains`.
6. Future signups with the same `email_domain` can be created as `approved`, but they still need email verification before member access.

Recommended constraints:

- Only admins can promote another user to admin.
- A user should not be able to remove the last admin account.
- Members should not directly update their own status, role, institution review fields, or review notes from the browser.
- Rejected users should not access member routes even if they have a valid Supabase session.
- Admins should not trust personal email domains.

## Error Handling

Use consistent error responses for JSON routes:

```json
{
  "error": "Human-readable message"
}
```

Recommended status codes:

- `400`: invalid input.
- `401`: not signed in.
- `403`: signed in but not allowed.
- `404`: missing or unavailable resource.
- `409`: duplicate slug or domain.
- `500`: unexpected server error.

## Logging

For version one, keep logging simple:

- Log server errors to Vercel logs.
- Store successful video redirects in `video_access_events`.
- Do not store sensitive medical information.
- Do not log passwords or full auth tokens.

## Rate Limiting

Rate limiting is optional for the first private launch. If needed later, add Upstash Redis and rate limit:

- Signup attempts by IP.
- Sign-in attempts are mostly handled by Supabase Auth.
- Admin mutation routes.

Do not add Redis until abuse or traffic makes it necessary.

## Testing Checklist

Test these backend cases before launch:

- Public user sees playable public videos and locked member-only metadata.
- Public user can see locked member-only names and descriptions, but does not receive a member-only watch path or YouTube URL.
- Public user cannot open member-only `/watch/[slug]`.
- Approved member with verified email can open member-only `/watch/[slug]`.
- Approved member without verified email cannot open member-only `/watch/[slug]`.
- Pending user cannot open member-only videos.
- Gmail signup is rejected.
- New institutional domain signup creates a pending profile with institution name and country.
- Trusted institutional domain signup creates an approved profile that still requires email verification before member access.
- Failed profile creation after Auth user creation is cleaned up or recoverable.
- Approving a pending member can add that member's domain to `allowed_email_domains`.
- Non-admin cannot access admin routes.
- Admin can create and publish a video.
- Draft videos never appear in public or member catalog.
