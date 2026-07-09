# Domain and DNS Setup

## Short Answer

You do not need to buy a domain before building the website. Vercel gives every deployed project a free domain like:

```text
your-project-name.vercel.app
```

You can use that free Vercel URL while building and testing. Later, when you are ready for a more professional public launch, you can buy a custom domain such as:

```text
radiologylearning.com
```

Then you connect that domain to Vercel and add it to Supabase Auth settings.

## What the Domain Does

The domain is the public address people type into the browser.

Example:

```text
https://radiologylearning.com
```

The domain does not store your website, users, or videos. It only points visitors to the hosting provider.

For this project:

- Vercel hosts the website.
- Supabase handles sign up, sign in, and database.
- YouTube hosts the actual videos.
- The domain points to Vercel.

## Recommended Beginner Path

Use this order:

1. Build the website locally.
2. Deploy to Vercel using the free `.vercel.app` domain.
3. Connect Supabase Auth to the Vercel URL.
4. Test sign up, sign in, and video access.
5. Buy a custom domain when the website is ready.
6. Add the custom domain to Vercel.
7. Update Supabase Auth and environment variables.

This avoids paying for a domain before the website is working.

## Where To Buy a Domain

You can buy a domain from a registrar. Common choices:

- Vercel Domains.
- Namecheap.
- Cloudflare Registrar.
- GoDaddy.
- Google Domains replacement providers such as Squarespace Domains.

For a beginner, the easiest option is often buying the domain directly through Vercel because DNS connection is simpler.

## Domain Name Tips

Choose something:

- Short.
- Easy to spell.
- Related to radiology education.
- Professional.
- Not too close to another brand or institution name.

Example ideas:

```text
radiologyvideolibrary.com
radiologylearninghub.com
radiologyteaching.com
radiologyreviewvideos.com
```

Avoid using hospital, university, or trademarked names unless you own or are authorized to use them.

## Domain Cost

Domains are usually paid yearly. Many `.com` domains cost around:

```text
$10-$25 per year
```

Premium domains can cost much more. You do not need a premium domain for this project.

## Important Domain Terms

| Term | Meaning |
| --- | --- |
| Domain | The website address, such as `example.com` |
| Registrar | Company where you buy the domain |
| DNS | Settings that tell the internet where the domain should point |
| Nameservers | DNS servers that control all DNS records for the domain |
| A record | Points root domain to an IP address |
| CNAME record | Points a subdomain to another hostname |
| Root/apex domain | The main domain, such as `example.com` |
| Subdomain | A prefix such as `www.example.com` or `app.example.com` |

## Recommended Domain Structure

Use:

```text
https://yourdomain.com
https://www.yourdomain.com
```

Vercel can redirect one to the other. A common choice is:

- Primary: `yourdomain.com`
- Redirect: `www.yourdomain.com` redirects to `yourdomain.com`

Either direction is acceptable. The important thing is to pick one primary domain.

## Option A: Buy the Domain Through Vercel

This is the simplest path.

Steps:

1. Go to the Vercel dashboard.
2. Open the project.
3. Go to **Settings**.
4. Go to **Domains**.
5. Search for the domain you want.
6. Buy the domain through Vercel.
7. Vercel automatically configures the DNS records.
8. Wait for DNS verification.
9. Vercel provisions HTTPS automatically.

After this, your website can be available at:

```text
https://yourdomain.com
```

## Option B: Buy the Domain Somewhere Else

If you buy from Namecheap, Cloudflare, GoDaddy, or another registrar, you need to connect it to Vercel manually.

High-level steps:

1. Buy the domain from the registrar.
2. Go to Vercel project settings.
3. Add the domain under **Settings > Domains**.
4. Vercel shows the DNS records you need.
5. Go to your registrar DNS settings.
6. Add or update those records.
7. Return to Vercel and wait for verification.

## DNS Records for Vercel

Vercel usually recommends:

### Root Domain

For:

```text
yourdomain.com
```

Add an `A` record:

```text
Type: A
Name: @
Value: 76.76.21.21
```

### WWW Subdomain

For:

```text
www.yourdomain.com
```

Add a `CNAME` record:

```text
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Vercel will show the exact records in your project dashboard. Follow Vercel's displayed values if they differ.

## Nameserver Option

Some registrars let you change nameservers. If you point nameservers to Vercel, Vercel controls all DNS records for that domain.

This can be easier if:

- You want Vercel to manage everything.
- You do not have custom email DNS records.
- This is a new domain used only for the website.

This can be risky if:

- The domain already has email configured.
- The domain already has other services.
- You are not sure what existing DNS records do.

For a new personal website domain, either Vercel-managed DNS or manual `A`/`CNAME` records is fine.

## HTTPS Certificate

Vercel automatically creates and renews the HTTPS certificate after DNS is correct.

You should not need to buy an SSL certificate separately.

Your final website should use:

```text
https://yourdomain.com
```

not:

```text
http://yourdomain.com
```

## Connecting the Domain to Supabase

Supabase needs to know which URLs are allowed for auth redirects.

After your Vercel domain works, go to:

```text
Supabase Dashboard > Authentication > URL Configuration
```

Set the Site URL:

```text
https://yourdomain.com
```

Add redirect URLs:

```text
http://localhost:3000/**
https://your-project-name.vercel.app/**
https://yourdomain.com/**
https://www.yourdomain.com/**
```

Why this matters:

- Sign up email verification links need to return to your website.
- Password reset links need to return to your website.
- Sign in redirects need to use trusted domains.

## Vercel Environment Variables

Update this variable in Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Keep these unchanged unless your Supabase project changes:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

After changing environment variables, redeploy the Vercel project.

## Local Development URL

When developing locally, keep:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Local development and production can use different values.

## Email Address for the Domain

A domain does not automatically give you email.

For example, buying:

```text
radiologylearning.com
```

does not automatically create:

```text
admin@radiologylearning.com
```

If you want domain email later, use a service such as:

- Google Workspace.
- Microsoft 365.
- Zoho Mail.
- Proton Mail.
- Cloudflare Email Routing for forwarding only.

Domain email is optional for the first version. You can launch the site without it.

## Recommended Setup for This Project

For this radiology video site:

1. Start with the free Vercel domain.
2. Build and test the website.
3. Use Supabase Auth with the Vercel URL.
4. Buy a `.com` domain when ready.
5. Add the domain to Vercel.
6. Set the custom domain as the production domain.
7. Add the custom domain to Supabase Auth redirect URLs.
8. Update `NEXT_PUBLIC_SITE_URL`.
9. Redeploy.

## Example Final Configuration

Assume the domain is:

```text
radiologylearninghub.com
```

Vercel:

```text
Production domain: radiologylearninghub.com
Redirect: www.radiologylearninghub.com -> radiologylearninghub.com
```

Supabase Site URL:

```text
https://radiologylearninghub.com
```

Supabase Redirect URLs:

```text
http://localhost:3000/**
https://radiology-portfolio.vercel.app/**
https://radiologylearninghub.com/**
https://www.radiologylearninghub.com/**
```

Vercel environment variable:

```env
NEXT_PUBLIC_SITE_URL=https://radiologylearninghub.com
```

## Troubleshooting

### Vercel Says Domain Is Not Verified

Wait a few minutes and refresh. DNS changes can take time.

If it still fails:

- Check that the `A` record points to `76.76.21.21`.
- Check that the `CNAME` record points to `cname.vercel-dns.com`.
- Remove conflicting old records.
- Confirm the domain was typed correctly.

### Website Works on Vercel URL but Not Custom Domain

Likely DNS is not configured yet or still propagating.

Check:

- Domain exists in Vercel project settings.
- DNS records match Vercel instructions.
- HTTPS certificate status is ready.

### Sign In Works Locally but Not on Custom Domain

Likely Supabase redirect URLs are missing.

Check:

- Supabase Site URL uses the custom domain.
- Supabase Redirect URLs include the custom domain.
- Vercel `NEXT_PUBLIC_SITE_URL` uses the custom domain.
- The app was redeployed after env changes.

### Password Reset Link Goes to the Wrong Website

Check Supabase Auth URL configuration and email templates.

Make sure the production domain is:

```text
https://yourdomain.com
```

not the old Vercel preview URL.

## Launch Checklist

- Domain purchased.
- Domain added to Vercel.
- Root domain works.
- `www` domain redirects correctly.
- HTTPS is active.
- Supabase Site URL is updated.
- Supabase Redirect URLs include local, Vercel, and custom domains.
- Vercel `NEXT_PUBLIC_SITE_URL` is updated.
- Production redeploy completed.
- Sign up email verification tested.
- Sign in tested.
- Password reset tested.
- Member-only video redirect tested on custom domain.
