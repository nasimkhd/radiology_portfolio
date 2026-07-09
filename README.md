# Radio From Scratch

A curated radiology education portal. Public visitors can preview a few lessons
and see locked member-only cards; verified medical members (approved + email
verified) get the full catalog with access-checked YouTube redirects. An admin
dashboard manages videos, trusted email domains, and member review.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**.

> Security: never commit secrets. Use `.env.local` (git-ignored). If a Supabase
> key or database password was ever committed, rotate it in the Supabase
> dashboard.

## Tech stack

- Next.js 16 (App Router, Server Components, Server Actions)
- Supabase (Auth + Postgres, Row Level Security)
- Tailwind CSS v4 + hand-rolled shadcn-style UI primitives
- YouTube as the video host (URLs revealed only after an access check)

## Getting started

### 1. Install dependencies

```bash
npm install
```

Node.js 22+ is recommended (`@supabase/supabase-js` warns on Node 20).

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values from your Supabase project (Project Settings → API):

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Safe for the browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe for the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only secret.** Never expose to the browser |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; your domain in production |
| `RESEND_API_KEY` | (Optional) Sends approval/rejection emails |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Radio From Scratch <hello@yourdomain.com>` (avoid `noreply@`) |
| `SITE_CONTACT_EMAIL` | Reply-To / contact address on the same domain |

### 3. Set up the database

In the Supabase SQL editor, run the migration then the seed:

1. `supabase/migrations/0001_init.sql` — tables, helper functions, RLS policies.
2. `supabase/seed.sql` — categories, example domains, and placeholder videos.

The seed videos use **placeholder** YouTube IDs (`REPLACE_ME_*`). Replace them
with real links in the admin dashboard (or edit the seed) before launch.

### 4. Supabase Auth settings

- Enable the Email provider and require email confirmation.
- Set **Site URL** to your production domain (e.g. `https://radiofromscratch.ca`).
- Add redirect URLs: `http://localhost:3000/**`, `http://localhost:3001/**`, and your deployed domain(s).
- In **Email Templates → Confirm signup**, replace `{{ .ConfirmationURL }}` with a same-domain link:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Confirm your email
</a>
```

That keeps the confirm link on your domain (better deliverability) and works with `/auth/confirm`.

### 5. (Optional) Test signup with a personal email

By default, Gmail and other personal domains are rejected. For local testing only,
add this to `.env.local`:

```bash
ALLOW_PERSONAL_EMAIL_SIGNUP=true
```

Restart the dev server after changing env vars. Do **not** enable this in production.

### 6. Run

```bash
npm run dev
```

Open http://localhost:3000.

### 7. Create the first admin

Sign up with your institutional email, then in the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin', membership_status = 'approved'
where email = 'you@your-institution.edu';
```

Verify your email, sign out and back in, and the Admin nav appears.

## Membership model

| State | Access |
| --- | --- |
| Public visitor | Public pages, preview videos, locked member metadata |
| Pending | Pending-approval page only |
| Approved + verified email | Full catalog + YouTube redirects |
| Rejected | No member access |
| Admin | Full catalog + admin dashboard |

Member access requires **both** `membership_status = 'approved'` **and** a
verified Supabase Auth email. Signup rejects personal email domains (Gmail,
Yahoo, etc.); new institutional domains stay pending until an admin approves the
member and optionally trusts the domain for future automatic approvals.

## Project structure

```
app/
  (site)/        Public pages: home, /videos, /about
  (auth)/        Sign in/up, pending approval, verify email, password reset
  (dashboard)/   Member dashboard + full video library (protected)
  (admin)/       Admin dashboard, videos, members, domains (admin only)
  api/auth/      Sign-up route handler
  auth/callback/ Email verification / password reset callback
  watch/[slug]/  Access-checking YouTube redirect
components/       UI primitives + feature components
lib/              Supabase clients, auth/access helpers, domain + youtube utils
supabase/         SQL migration + seed
proxy.ts          Session refresh + coarse route gating (Next.js 16 proxy)
```

## Security model

Access is enforced in three layers:

1. Server components / route handlers / server actions check session, verified
   email, and profile status.
2. Supabase Row Level Security protects rows at the database.
3. Admin mutations verify `role = 'admin'` and run via the service-role client.

Member-only `youtube_url` values are never sent to the browser in catalog
responses — they are only resolved inside `/watch/[slug]` after an access check.

## Deployment (Vercel)

1. Push to GitHub and import into Vercel newly added domain (Next.js preset).
2. Add the four environment variables.
3. Deploy, then add the Vercel URL to Supabase Auth redirect URLs.
4. See `docs/08-cloud-deployment.md` and `docs/10-domain-and-dns-setup.md`.
```


