# Cloud Deployment

## Recommended Cloud Setup

Use:

- Vercel Hobby for hosting the Next.js app.
- Supabase free tier for Auth and Postgres.
- YouTube for video hosting.
- GitHub for source control.

This is suitable for a personal website and can start at no cost, subject to each provider's free-tier limits.

## Accounts Needed

- GitHub account.
- Vercel account connected to GitHub.
- Supabase account.
- YouTube channel with uploaded videos.

## Supabase Setup

1. Create a new Supabase project.
2. Choose a region close to the expected audience.
3. Save the project URL and anon key.
4. Enable email/password authentication.
5. Configure email verification.
6. Add production redirect URLs after the Vercel domain exists.
7. Create the database tables and RLS policies from the schema doc.

## Supabase Auth Settings

Recommended settings:

- Enable email provider.
- Require email confirmation.
- Disable public OAuth providers for version one unless needed.
- Configure password reset redirect URL.
- Customize the Confirm signup email template so the link uses your domain (not `*.supabase.co`).

### Site URL and redirect URLs

In **Authentication → URL Configuration**:

- **Site URL:** `https://radiofromscratch.ca` (production)
- **Redirect URLs:**

```text
http://localhost:3000/**
http://localhost:3001/**
https://radiofromscratch.ca/**
https://www.radiofromscratch.ca/**
```

### Confirm signup email template (required for deliverability)

Default `{{ .ConfirmationURL }}` links look like
`https://….supabase.co/auth/v1/verify?…` which mismatches your sending domain
and often lands in Junk. Replace the button/link with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Confirm your email
</a>
```

Use the same pattern for **Magic Link** and **Reset Password** templates,
changing `type` as needed (`email`, `recovery`). The app handles these at
`/auth/confirm` via `verifyOtp`.

Redirect URLs:

```text
http://localhost:3000/**
https://your-vercel-domain.vercel.app/**
https://your-custom-domain.com/**
```

Use the actual deployed domains when available.

## Supabase Database Setup

Run migrations or SQL scripts for:

- `profiles`
- `allowed_email_domains`
- `categories`
- `videos`
- `video_access_events`
- Helper functions
- RLS policies

Seed initial data:

- First admin profile.
- Optional initial trusted email domains.
- Initial categories.
- 2 or 3 public videos.
- Initial member-only videos.

## First Admin Account

Recommended process:

1. Sign up through the site with your own institutional email.
2. In Supabase SQL editor, update your profile:

```sql
update public.profiles
set role = 'admin',
    membership_status = 'approved'
where email = 'your-email@example.edu';
```

3. Sign out and sign back in.
4. Confirm the admin navigation appears.

Do this only for your own trusted account.

## Vercel Setup

1. Push the repository to GitHub.
2. Import the GitHub repository into Vercel.
3. Select the Next.js framework preset.
4. Add environment variables.
5. Deploy.
6. Copy the Vercel preview/production URL.
7. Add the Vercel URL to Supabase Auth redirect URLs.

## Environment Variables

Development `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Production Vercel variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Security notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` is secret and server-only.
- Never commit `.env.local`.
- Use Vercel's encrypted environment variable storage.

## Custom Domain

Optional after the first deployment:

1. Buy or choose a domain.
2. Add it in Vercel project settings.
3. Update DNS as Vercel instructs.
4. Add the custom domain to Supabase redirect URLs.
5. Update `NEXT_PUBLIC_SITE_URL`.
6. Redeploy.

## Email Deliverability

Supabase default auth emails are acceptable for early testing. If the site grows, configure a custom SMTP provider for better deliverability and branding.

Recommended later options:

- Resend.
- Postmark.
- SendGrid.

Version one can launch without custom SMTP if the volume is low.

## Security Checklist

Before launch:

- RLS is enabled on all public tables.
- Public users can see locked member-only metadata only through server responses that omit YouTube URLs and playable watch paths.
- Service role key is only in Vercel environment variables.
- Signup domain check runs server-side.
- Personal email domains are rejected.
- New institutional domains stay pending until admin approval.
- Trusted institutional domains can be approved automatically, but member access still requires verified email.
- Admin routes check `role = admin`.
- Profile status, role, and review fields cannot be updated directly by members from the browser.
- Draft videos are not visible.
- Password reset redirects use trusted domains.
- Supabase Auth redirect URLs do not include unknown domains.

## Cost Control

Keep the first version inexpensive:

- Store only metadata in Supabase.
- Host videos on YouTube.
- Avoid Redis until rate limiting is needed.
- Avoid paid email provider until auth email volume grows.
- Avoid YouTube API unless automatic import is necessary.

## Monitoring

For version one:

- Use Vercel deployment logs for server errors.
- Use Supabase logs for database/auth issues.
- Use `video_access_events` for basic video click tracking.
- Use YouTube Studio for video performance analytics.

Add dedicated analytics later only if needed.

## Backup Plan

Periodically export:

- Supabase schema.
- Video metadata.
- Allowed domains.
- Category list.

Because the site stores metadata only, backups should be small.

## Launch Checklist

- Homepage content is final.
- About page is final.
- Public preview videos are selected.
- Member-only videos are added.
- Signup rejects Gmail/Yahoo/Outlook/iCloud.
- New institutional domain signup creates a pending account with institution name and country.
- Admin approval can store the member's domain as trusted.
- A later signup from the same trusted domain is approved automatically but cannot access member videos until email verification is complete.
- First admin account works.
- Member signup works.
- Approved verified member redirect to YouTube works.
- Public user can see locked member-only metadata but cannot access member-only redirect or YouTube URL.
- Mobile layout is tested.
- Footer disclaimer is visible.
- Supabase redirect URLs match deployed domains.
- Vercel production deployment succeeds.
