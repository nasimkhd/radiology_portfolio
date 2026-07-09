# Implementation Roadmap

## Overview

This roadmap turns the documentation into a practical build sequence. The project is currently greenfield, so the first implementation step is to scaffold the application.

Recommended build order:

1. Project scaffold.
2. Supabase setup.
3. Public pages and design system.
4. Auth and medical-domain signup.
5. Video catalog and redirect flow.
6. Admin tools.
7. Testing and deployment.

## Phase 1: Scaffold the App

Goal: create the base Next.js application.

Tasks:

- Initialize Next.js with TypeScript and App Router.
- Add Tailwind CSS.
- Add shadcn/ui.
- Add Supabase packages.
- Create base folders:
  - `app/`
  - `components/`
  - `lib/`
  - `lib/supabase/`
  - `app/(public)/`
  - `app/(auth)/`
  - `app/(dashboard)/`
  - `app/admin/`

Suggested command when implementation begins:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app
```

Only run this after confirming it is acceptable to scaffold inside the current repository.

## Phase 2: Supabase Foundation

Goal: connect the app to Supabase Auth and Postgres.

Tasks:

- Create Supabase project.
- Add environment variables.
- Install `@supabase/supabase-js` and `@supabase/ssr`.
- Create server, browser, and admin Supabase clients.
- Add database tables.
- Enable RLS.
- Add helper functions and policies.
- Seed initial categories and videos.

Exit criteria:

- App can connect to Supabase locally.
- Public videos can be queried.
- RLS is active.
- Profile updates for membership status, role, and review fields are admin/server-only.

## Phase 3: Public Website

Goal: make the site look credible before adding complex membership behavior.

Pages:

- `/`
- `/videos`
- `/about`

Components:

- Header.
- Footer.
- Hero.
- Video card.
- Locked video card.
- Category badge.
- Educational disclaimer.

Exit criteria:

- Public visitor sees playable public preview videos and locked member-only metadata.
- The site works on desktop and mobile.
- Public pages do not require login.

## Phase 4: Auth and Medical Signup

Goal: let qualified users create accounts while rejecting personal emails.

Pages:

- `/sign-up`
- `/sign-in`
- `/pending-approval`

Backend:

- `/api/auth/sign-up`
- Session helper.
- Profile helper.
- Domain validation helper.

Tasks:

- Build sign-up form.
- Build sign-in form.
- Add personal-domain denylist.
- Add trusted-domain lookup.
- Create profile during signup.
- Store institution name and institution country for admin review.
- Add recovery behavior for failed profile creation after Supabase Auth user creation.
- Set new institutional domains to `pending`.
- Auto-approve signups only when the email domain is already trusted.
- Redirect users based on profile status and email verification state.

Exit criteria:

- Gmail/Yahoo/Outlook/iCloud signup is rejected.
- New institutional domain signup creates a pending profile with institution review context.
- Trusted institutional domain signup creates an approved profile but still requires email verification before member access.
- Pending users cannot access member videos.
- Approved users with verified email can access dashboard.

## Phase 5: Member Video Library

Goal: approved members can browse the full curated catalog.

Pages:

- `/dashboard`
- `/dashboard/videos`

Features:

- Search.
- Category filters.
- Full video grid.
- Recently added section.
- Empty states.

Backend:

- `getVisibleVideos()`.
- `requireApprovedMember()`.

Exit criteria:

- Public users see playable preview videos plus locked member-only names and descriptions.
- Approved members with verified email see all published videos with playable watch actions.
- Draft and archived videos remain hidden.

## Phase 6: YouTube Redirect Flow

Goal: all video clicks go through a server access check before redirecting.

Route:

- `/watch/[slug]`

Tasks:

- Load video by slug.
- Check status.
- Check access level.
- Check user membership and email verification when needed.
- Record optional access event.
- Redirect to YouTube.

Exit criteria:

- Public preview videos redirect correctly.
- Member-only videos redirect only for approved members with verified email.
- Unauthorized users are sent to sign in or pending approval.
- Member-only YouTube URLs are not exposed in public catalog responses.

## Phase 7: Admin Tools

Goal: allow the site owner to manage the catalog without editing the database manually.

Pages:

- `/admin`
- `/admin/videos`
- `/admin/videos/new`
- `/admin/videos/[id]`
- `/admin/domains`
- `/admin/members`

Features:

- Create and edit video records.
- Publish, draft, or archive videos.
- Add trusted medical domains.
- Review institution name, institution country, and notes for pending users.
- Approve or reject users.
- Trust a member's email domain during approval so future signups from that domain are automatic.
- Promote trusted users to admin if needed.

Exit criteria:

- Non-admins cannot access admin pages or actions.
- Admin can add a video and publish it.
- Admin can add a trusted domain.
- Admin can approve a member and trust that member's domain.

## Phase 8: Testing

Goal: verify the complete visitor and member journey.

Manual tests:

- Public homepage loads.
- Public videos page shows preview videos and locked member-only metadata.
- Locked member cards do not reveal YouTube URLs or member-only watch paths.
- Sign-up rejects personal email domains.
- Sign-up from a new institutional domain creates a pending account with institution name and country.
- Failed profile creation after Auth user creation is cleaned up or recoverable.
- Admin can approve a pending account and store the domain as trusted.
- Sign-up from a trusted institutional domain creates an approved account that still requires email verification before member access.
- Sign-in redirects by membership status and email verification state.
- Approved member sees full catalog.
- Approved member with verified email can open member-only YouTube links.
- Approved member without verified email cannot open member-only YouTube links.
- Pending member cannot open member-only links.
- Admin can manage videos.
- Admin can manage domains.

Automated tests to add later:

- Domain validation unit tests.
- Access helper tests.
- Redirect route tests.
- RLS policy checks with Supabase test users.
- Signup recovery tests for profile creation failures.

## Phase 9: Deployment

Goal: publish the site on Vercel.

Tasks:

- Push code to GitHub.
- Import repository into Vercel.
- Add Supabase environment variables.
- Deploy preview.
- Add Vercel URL to Supabase redirect URLs.
- Test signup and sign-in on deployed preview.
- Promote to production.
- Add custom domain if desired.

Exit criteria:

- Production homepage works.
- Production auth redirects work.
- Production database access works.
- Public/member access rules work in production.

## Phase 10: Post-Launch Improvements

Consider these after the first working launch:

- Custom auth email templates.
- Better analytics dashboard.
- Automatic YouTube playlist import.
- Email notifications for approval.
- Contact form.
- Member profile page.
- Saved videos.
- Paid membership or donation support.
- More advanced video provider if strict content protection becomes necessary.

## Suggested Milestones

| Milestone | Result |
| --- | --- |
| Milestone 1 | Public portfolio site with preview videos |
| Milestone 2 | Supabase Auth and medical signup gate |
| Milestone 3 | Approved member video catalog |
| Milestone 4 | YouTube redirect and access logging |
| Milestone 5 | Admin dashboard |
| Milestone 6 | Vercel production launch |

## Build Philosophy

Keep the first version small and reliable. The most important behavior is not a complex UI; it is correct access control:

- Public users can play only selected previews.
- Public users can see locked member-only names and descriptions, but cannot play them.
- Medical-affiliated members with verified email can access the full catalog.
- Personal email accounts are blocked.
- New institutional domains are reviewed before becoming trusted.
- YouTube remains the video host.

Once that is working, the design and admin experience can improve gradually.
