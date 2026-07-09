# Product Overview

## Purpose

The website is a radiology education hub that showcases selected YouTube videos while reserving playback access to the full learning library for verified medical-affiliated members.

The site should feel professional, trustworthy, and simple. It should not try to replace YouTube as the video host. Instead, it should act as a curated front door: visitors browse video names and descriptions on the website, and approved verified members click through to the original YouTube videos.

## Primary Audience

The intended audience is medical or medical-adjacent learners and professionals, including:

- Radiology residents.
- Medical students.
- Physicians.
- Allied health professionals.
- Researchers or institutional staff with a medical organization email address.

The signup flow should reject generic personal email addresses. New institutional domains should start as pending until the admin approves a user from that domain.

## Product Goals

- Present the creator's radiology video content in a polished portfolio.
- Let anyone preview 2 or 3 public videos.
- Let public visitors see locked member-only video names and descriptions without exposing playable links.
- Require signup, approval, and verified email before opening member-only videos.
- Enforce medical affiliation through admin review and a learned institutional email allowlist.
- Keep video hosting on YouTube to avoid storage, bandwidth, and copyright complexity.
- Avoid depending on YouTube posts or channel feed availability.
- Keep the site inexpensive enough for a personal project by using free tiers where possible.

## Non-Goals

- The website will not upload or stream video files directly.
- The website will not copy YouTube videos into private storage.
- The website will not use personal emails as proof of medical affiliation.
- The first version will not include paid subscriptions.
- The first version will not need complex learning management features such as quizzes, certificates, or CME tracking.

## Membership Model

There are three practical user states:

| User State | Description | Video Access |
| --- | --- | --- |
| Public visitor | Not signed in | Can see public pages, public preview videos, and locked member-only video metadata |
| Pending member | Signed up with a non-personal institutional email that has not been approved yet | Can sign in, but sees a pending approval message and cannot open member-only videos |
| Approved member | Signed in, approved, and email verified | Can see the full catalog and open YouTube links |

The recommended first release should keep users pending unless their email domain is already in the trusted-domain list. When an admin approves a pending member, the app can add that member's email domain to `allowed_email_domains` so future signups from the same domain are approved automatically. Even auto-approved users must verify their email before receiving member video access.

## Public Video Rules

Public visitors should see:

- A clear hero section that explains the site.
- A short preview library with only 2 or 3 public videos.
- Locked member-only cards that can show the video title, category, thumbnail, and description.
- Sign up and sign in calls to action.

Public visitors should not receive member-only video URLs from the backend, and locked member-only cards should not link to the redirect route. Their CTA should send users to sign up or sign in instead of attempting playback.

## Member Video Rules

Approved verified members should see:

- The full catalog of public and member-only videos.
- Search and category filters.
- A direct action such as "Watch on YouTube."
- Optional recently added or featured sections.

When a member clicks a video, the site should route through an internal redirect endpoint before going to YouTube. This makes it possible to check access and optionally record the click.

## YouTube Behavior

The website should not rely on YouTube channel posts. If YouTube shows "no posts available," the website can still work because the database stores curated video records manually.

Each video record should store:

- Title.
- Description.
- YouTube URL.
- Thumbnail URL or YouTube video ID.
- Access level: public or members only.
- Category.
- Display order.
- Published or draft status.

## Core User Journeys

### Public Visitor Watches a Preview

1. Visitor lands on the homepage.
2. Visitor sees a professional introduction and preview videos.
3. Visitor clicks a public video.
4. Website redirects to the YouTube URL.

### Visitor Tries to Access Member Content

1. Visitor opens the video library.
2. Website shows playable public videos and locked member-only cards.
3. Visitor clicks "Sign up to access full library."
4. Visitor reaches the signup page.

### Medical User Signs Up

1. User enters full name, affiliated institution, affiliated institution country, institutional email, and password.
2. Server extracts the email domain.
3. Server rejects obvious personal email domains.
4. Server checks `allowed_email_domains`.
5. If the domain is already trusted, Supabase creates the auth user and an approved profile.
6. If the domain is new, Supabase creates the auth user and a pending profile with institution review context.
7. The user must verify their email before accessing member videos.
8. After admin approval, the domain can be stored in `allowed_email_domains` for future automatic approvals.

### Personal Email Tries to Sign Up

1. User enters an email such as `example@gmail.com`.
2. Server rejects the signup before creating a membership profile.
3. User sees a helpful error message explaining that an institutional medical email is required.

### Approved Member Opens a Video

1. Member signs in with a verified email.
2. Member browses the full catalog.
3. Member clicks "Watch on YouTube."
4. Website checks the session, verified email, profile approval, and video access level.
5. Website optionally records a `video_access_events` row.
6. Website redirects to the stored YouTube URL.

## Success Criteria

- Public visitors can discover video names and descriptions, but only public preview videos can be played.
- Approved members with verified email can access the full video catalog and open member-only videos.
- Generic personal email domains cannot create approved accounts.
- New institutional domains require admin approval before they become trusted.
- YouTube URLs are never exposed for member-only videos unless access is verified.
- The website can be hosted on free or low-cost Vercel and Supabase tiers.
- The site is maintainable by one person without complex operations.
