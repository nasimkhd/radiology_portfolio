# Auth and Membership

## Recommendation

Use Supabase Auth for the first version because it has a free tier, includes email/password authentication, and stores users in the same Supabase project as the video catalog.

The app should still wrap Supabase Auth with its own signup flow so it can enforce medical-affiliation rules before granting access.

## Auth Requirements

- Users can create an account with email and password.
- Users must verify their email address before admin review or member access.
- Generic personal email domains should be rejected.
- Institutional medical domains should be checked against a learned allowlist.
- Users from new institutional domains stay pending until admin approval (after email verification).
- Approved members can access the full video catalog once email is verified and membership is approved.
- Admin users can manage videos and allowed domains.
- Sessions should work across server-rendered pages and client components.

## Membership States

| State | Meaning | Access |
| --- | --- | --- |
| `public` | No account or not signed in | Public pages and public videos only |
| `pending` | Signed up but awaiting review | Pending approval page only |
| `approved` | Approved medical member with verified email | Full video catalog |
| `rejected` | Signup reviewed and denied | No member catalog access |
| `admin` | Trusted site owner or manager | Full catalog and admin dashboard |

In the database, the profile can store both `membership_status` and `role`. Example:

- `membership_status`: `pending`, `approved`, `rejected`
- `role`: `member`, `admin`

This keeps approval separate from administrator permissions.

Member access must require both, in this order for the user journey:

1. A verified Supabase Auth email (`auth.users.email_confirmed_at is not null`).
2. `membership_status = approved` in `profiles`.

Do not send unverified users to the pending-approval page, and do not treat an approved profile alone as enough access if the user has not confirmed their email yet.

## Medical Email Policy

The recommended policy is a learned allowlist of institutional domains, plus a denylist for obvious personal domains.

Examples of personal domains to deny:

- `gmail.com`
- `yahoo.com`
- `hotmail.com`
- `outlook.com`
- `icloud.com`
- `aol.com`
- `proton.me`

Examples of institutional medical domains might include domains from:

- Hospitals.
- Universities.
- Medical schools.
- Health systems.
- Research institutions.

Do not try to detect every medical domain automatically. Medical affiliation is best handled with admin review and a curated allowlist that can grow over time.

In version one, `allowed_email_domains` should act like a trusted-domain dictionary:

- If the domain is already in `allowed_email_domains`, the new user can be approved automatically.
- If the domain is not in `allowed_email_domains` but is not a personal email domain, create the user as `pending`.
- When an admin approves that pending user, add the user's email domain to `allowed_email_domains`.
- Future signups from the same domain can then be approved automatically.

## Signup Enforcement

The signup flow should run through a server route or server action:

1. Normalize the email address.
2. Extract the domain after `@`.
3. Check the domain against the personal-domain denylist.
4. Check the domain against `allowed_email_domains`.
5. If the domain is personal, return a clear message before creating a member profile.
6. Collect profile review context such as institution name and institution country.
7. If the domain is trusted, create the Supabase Auth user and set `membership_status = approved`.
8. If the domain is not trusted but appears institutional, create the Supabase Auth user and set `membership_status = pending`.
9. Send the user to email verification first. After they confirm, route approved users to the library and pending users to the pending-approval page.
10. When an admin approves the pending profile, notify the member by email and insert the email domain into `allowed_email_domains` so later users from that domain can be approved automatically.

Client-side validation can show faster feedback, but it is only a convenience. The server must be the final authority.

## Signup Failure Recovery

Creating a Supabase Auth user and creating the matching `profiles` row are separate operations. The signup route should handle the case where the Auth user is created but the profile insert fails.

Recommended recovery behavior:

1. Create the Auth user from the server route.
2. Immediately create the `profiles` row with `fName`, `lName`, `email`, `email_domain`, `institution_name`, `institution_country`, and the correct initial `membership_status`.
3. If profile creation fails, delete the just-created Supabase Auth user with the server-only admin client when possible.
4. If deletion fails, log the orphaned Auth user ID and show a retry/contact-support message.
5. On later sign-in, if a user has no profile, send them to account recovery or create the missing pending profile server-side after revalidating the email domain and institution fields.

This keeps Auth and membership data from drifting apart.

## Recommended First-Version Policy

For a personal site, start with:

- Email verification required.
- Reject obvious personal email domains.
- Store institution name and institution country for admin review.
- Create pending profiles for new institutional domains.
- Auto-approve only domains already stored in `allowed_email_domains`.
- Admin approval of a pending member can add that member's domain to `allowed_email_domains`.
- Admin can manually add or remove trusted domains.
- Admin can manually change a profile to `approved`, `pending`, or `rejected`.
- Member routes require both an approved profile and verified email.

This keeps the first user from each new institution under manual review while reducing work for later users from the same approved domain.

## Alternate Strict Policy

If the site begins attracting abuse or if domain-level trust is too broad, move to:

- Domain allowlist required.
- Email verification required.
- New users start as `pending`.
- Admin manually reviews and approves members.
- Admin can request proof of affiliation outside the app if needed.
- Admin approval does not automatically trust the whole domain unless the admin chooses to add it.

The database design should support both policies from the start.

## Sign-In Behavior

After sign-in:

- If the user has no profile, send them to an account recovery page or create the missing profile server-side.
- If `membership_status = pending`, send them to `/pending-approval`.
- If `membership_status = rejected`, show a respectful message and contact instructions.
- If `membership_status = approved` but the email is not verified, show email verification instructions.
- If `membership_status = approved` and the email is verified, send them to `/dashboard/videos`.
- If `role = admin`, show admin navigation.

## Password Reset

Supabase Auth should handle password reset emails. Configure redirect URLs so reset links return to the production domain:

- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Session Handling in Next.js

Use the Supabase server client in server components, route handlers, and server actions. Use the browser client only for client components that need live auth state.

Recommended package:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Recommended client separation:

- `lib/supabase/server.ts` for server-side session-aware client.
- `lib/supabase/client.ts` for browser client.
- `lib/supabase/admin.ts` for service-role operations in server-only code.

The admin/service-role client must never be imported into client components.

## Admin Permissions

An admin can:

- Create, edit, publish, unpublish, and delete video metadata.
- Add and remove allowed email domains.
- Approve, reject, or suspend members.
- Review institution name, institution country, and review notes for pending members.
- Approve a pending member and optionally trust that member's email domain for future automatic approvals.
- View basic access logs.

Admin checks should happen on the server. The UI can hide admin links, but API routes and server actions must verify `role = admin`.

## Error Messages

Use clear, helpful messages:

- Personal domain: "Please use your hospital, university, or medical institution email address."
- New institution: "Your account was created and is waiting for approval."
- Pending approval: "Your account was created and is waiting for approval."
- Rejected: "This account is not approved for member access."

Avoid wording that exposes too much internal logic or encourages guessing allowed domains.

## Abuse Prevention

For the first version:

- Enable Supabase email verification.
- Add basic rate limiting later if signup abuse appears.
- Keep the service role key private.
- Log failed signup attempts only if needed.
- Avoid storing sensitive medical or patient data.

This site should be educational only and should not collect patient information.
