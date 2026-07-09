# Frontend Design

## Design Direction

The site should look like a modern medical education portfolio: calm, credible, and easy to scan.

Recommended visual style:

- White or very light gray background.
- Deep navy or charcoal text.
- Blue or teal accent color.
- Rounded cards.
- Subtle borders instead of heavy shadows.
- Clean typography with generous spacing.
- Medical imagery used sparingly.

Avoid a loud entertainment-style YouTube clone. The site should feel closer to an educational library.

## UI Stack

Recommended frontend tools:

- Next.js App Router.
- React Server Components by default.
- Tailwind CSS for styling.
- shadcn/ui for accessible UI primitives.
- `next/image` for optimized thumbnails.
- Supabase server and browser clients for auth state.

Recommended shadcn/ui components:

- Button.
- Card.
- Badge.
- Input.
- Label.
- Alert.
- Dialog.
- Dropdown menu.
- Table.
- Tabs.
- Sheet for mobile navigation.

## Global Layout

Every page should include:

- Header with logo/name.
- Navigation links.
- Auth-aware actions.
- Main content area.
- Footer with copyright and educational disclaimer.

Example navigation:

| Link | Public Visitor | Member | Admin |
| --- | --- | --- | --- |
| Home | Yes | Yes | Yes |
| Videos | Yes | Yes | Yes |
| About | Yes | Yes | Yes |
| Dashboard | No | Yes | Yes |
| Admin | No | No | Yes |
| Sign in | Yes | No | No |
| Sign up | Yes | No | No |
| Sign out | No | Yes | Yes |

## Homepage

Purpose: explain what the site is and guide visitors toward preview videos or signup.

Recommended sections:

1. Hero.
2. Public preview videos.
3. Why join.
4. Medical-affiliation signup explanation.
5. About the creator.
6. Footer disclaimer.

Hero content should include:

- Clear headline, such as "Radiology Video Lessons for Medical Learners."
- Short subheading explaining that selected previews are public and the full library is for verified medical members.
- Primary CTA: "Browse Preview Videos."
- Secondary CTA: "Request Member Access."

## Videos Page

Route: `/videos`

Public version:

- Shows public preview videos with playable CTAs.
- Displays locked member-only teaser cards with title, thumbnail, category, and short description, but without exposing YouTube URLs or linking to `/watch/[slug]`.
- Includes signup CTA near the locked section.

Member version:

- Shows full video library.
- Includes category filters.
- Includes search by title or description.
- Shows "Watch on YouTube" button for every accessible video.

## Video Card

Each card should show:

- Thumbnail.
- Title.
- Category badge.
- Short description.
- Access badge: `Preview` or `Members`.
- CTA button.

Public video CTA:

- "Watch on YouTube."

Member-only video CTA for public users:

- "Sign up to unlock."
- This CTA should go to `/sign-up` or `/sign-in`, not to the video redirect route.

Member-only video CTA for approved members:

- "Watch on YouTube."

## Locked Member Content

Locked content should be honest but not frustrating.

Recommended locked-card text:

> Members-only lesson. Sign up with a hospital, university, or medical institution email to access the full library.

Do not show the full YouTube URL for locked videos. The title, thumbnail, category, and short description can be visible so users understand the value of membership, but public and pending users must not be able to play the video or hit the internal redirect route.

## Sign-Up Page

Route: `/sign-up`

Fields:

- Full name.
- Affiliated institution name.
- Affiliated institution country.
- Institutional email.
- Password.
- Confirm password.

Helpful copy:

> Use your hospital, university, medical school, or health-system email address. Personal email addresses such as Gmail, Yahoo, Outlook, and iCloud are not eligible.

Validation:

- Email must be formatted correctly.
- Institution name and country are required for admin review.
- Password must meet Supabase password rules.
- Confirm password must match.
- Server must reject personal domains and check whether the institutional domain is already trusted.

Success states:

- If the domain is already trusted: show email verification instructions. Redirect to the dashboard only after the email is verified.
- If the domain is new: redirect to `/pending-approval`.

## Sign-In Page

Route: `/sign-in`

Fields:

- Email.
- Password.

Links:

- "Forgot password?"
- "Need access? Sign up with your medical institution email."

After sign-in:

- Approved member with verified email: `/dashboard/videos`.
- Approved member without verified email: show email verification instructions.
- Pending member: `/pending-approval`.
- Rejected member: show access message.
- Admin: `/admin` or `/dashboard/videos` with admin navigation.

## Pending Approval Page

Route: `/pending-approval`

Purpose: explain that the account exists but is not yet approved.

Recommended content:

- Account status badge.
- Explanation of review.
- Contact instructions.
- Sign out button.

This page is required for the first user from each new institutional domain. After an admin approves a member and trusts the domain, future users from that domain can skip this review step.

## Member Dashboard

Route: `/dashboard`

Recommended sections:

- Welcome message.
- Quick link to full video library.
- Recently added videos.
- Featured categories.
- Account status card.

Keep this simple in version one. The video catalog is the main product.

## Full Video Catalog

Route: `/dashboard/videos`

Recommended layout:

- Page title: "Member Video Library."
- Search input.
- Category tabs or dropdown.
- Video grid.
- Empty state when no videos match the filters.

Empty state copy:

> No videos match your current filters.

Do not use "No posts available" as a website error. That message belongs to YouTube posts, not the curated website catalog.

## Admin Dashboard

Route: `/admin`

Admin pages:

- `/admin/videos`: manage video records.
- `/admin/videos/new`: add a video.
- `/admin/videos/[id]`: edit a video.
- `/admin/domains`: manage trusted email domains.
- `/admin/members`: review users.

Admin video form fields:

- Title.
- Slug.
- Description.
- YouTube URL.
- YouTube video ID.
- Thumbnail URL.
- Category.
- Access level.
- Status.
- Display order.

Admin domain form fields:

- Domain.
- Organization name.
- Auto-approve future users from this domain.
- Trust source.
- Notes.

Admin member review fields:

- Full name.
- Email and email domain.
- Institution name.
- Institution country.
- Membership status.
- Role.
- Review notes.
- Reviewed by and reviewed at.

## Mobile Design

The site should be fully usable on mobile:

- Header collapses into a menu.
- Video cards stack in one column.
- Forms use full-width inputs.
- Tables become cards or horizontally scroll.
- CTAs remain visible without crowding the screen.

## Accessibility

Minimum requirements:

- All form inputs have labels.
- Buttons use meaningful text.
- Color contrast is readable.
- Keyboard navigation works.
- Error messages are connected to fields.
- Thumbnail images have useful alt text.

## Educational Disclaimer

Add a footer disclaimer:

> Educational content only. This site does not provide medical advice, diagnosis, or treatment. Do not share patient-identifiable information.

This is important for a radiology education site.

## Suggested Initial Page Order

Build pages in this order:

1. Global layout and homepage.
2. Public videos page.
3. Sign-up and sign-in pages.
4. Pending approval page.
5. Member video catalog.
6. YouTube redirect flow.
7. Admin video management.
8. Admin domain and member management.
