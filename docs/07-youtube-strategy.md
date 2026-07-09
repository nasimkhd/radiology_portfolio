# YouTube Strategy

## Main Principle

Use YouTube only as the video playback destination. Do not depend on YouTube posts, community posts, or channel feed availability to build the website catalog.

The website should maintain its own curated video records in Supabase. Each record points to a YouTube URL.

## Why This Solves "No Posts Available"

YouTube may show "no posts available" when a channel has no community posts or when a feed section is empty. That does not mean the videos are unavailable.

The website should not display YouTube posts. It should display database records that you control:

- Title.
- Description.
- Thumbnail.
- Category.
- Access level.
- YouTube URL.

Because the catalog is controlled by your database, the site can show videos even if YouTube posts are empty.

## Video Hosting Options

### Recommended: Public or Unlisted YouTube Videos

Store YouTube URLs in the database and redirect users there.

Pros:

- Free video hosting.
- No bandwidth cost on your website.
- Easy to manage from YouTube Studio.
- Works well for a personal website.

Cons:

- YouTube controls playback experience.
- Anyone with the final YouTube URL may be able to share it if the video is public or unlisted.
- Website membership protects discovery, not absolute video secrecy.

### Not Recommended for Version One: Self-Hosted Videos

Self-hosting videos would require file storage, streaming, transcoding, CDN delivery, and access control. That is too much complexity and cost for the first version.

## Access Reality

If a member-only YouTube video is public or unlisted, the website can hide the URL from non-members, but it cannot prevent an approved member from sharing the final YouTube link with someone else.

If strict access control becomes necessary later, consider:

- YouTube private videos with manual invite access.
- Vimeo with domain/privacy controls.
- Mux or Cloudflare Stream with signed playback URLs.

For the current personal website, YouTube redirect access is the right balance of simplicity and cost.

## Recommended Video URL Format

Store both:

- `youtube_url`: the full destination URL.
- `youtube_video_id`: the stable video ID.

Example:

```text
youtube_url: https://www.youtube.com/watch?v=dQw4w9WgXcQ
youtube_video_id: dQw4w9WgXcQ
```

The video ID can generate a thumbnail:

```text
https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg
```

## Thumbnail Strategy

Use this priority:

1. Custom `thumbnail_url` from the admin form if provided.
2. YouTube-generated thumbnail from `youtube_video_id`.
3. Local placeholder image for missing thumbnails.

Recommended YouTube thumbnail URLs:

```text
https://img.youtube.com/vi/{youtubeVideoId}/hqdefault.jpg
https://img.youtube.com/vi/{youtubeVideoId}/maxresdefault.jpg
```

`maxresdefault.jpg` may not exist for every video, so the implementation should handle broken thumbnails gracefully.

## Redirect Strategy

All video CTAs should point to the internal route first:

```text
/watch/chest-xray-basics
```

The server then decides whether to redirect to YouTube.

This applies only to videos the current visitor is allowed to open. Public and pending users can see locked member-only video metadata, but locked member-only cards should send users to sign up or sign in instead of linking to `/watch/[slug]`.

Benefits:

- Central access check.
- Optional analytics.
- No member-only URLs in the rendered catalog for public users.
- Easy future migration to another video provider.

## Public Preview Videos

Choose 2 or 3 videos that:

- Represent the quality of the channel.
- Are safe to show publicly.
- Encourage signups without giving away the full library.
- Cover broad beginner-friendly topics.

Mark them in the database:

```text
access_level = public
status = published
```

## Member-Only Videos

Member-only videos should be marked:

```text
access_level = members
status = published
```

For public users, the website can show locked teaser cards with the video title, thumbnail, category, and description. These cards should not expose YouTube URLs and should not include playable redirect links.

## Draft Videos

Draft videos should never appear in public or member catalogs.

Use drafts when:

- You are preparing a new video page.
- You need to confirm the YouTube URL.
- You need to add a thumbnail or category.
- You are not ready to publish.

## Archived Videos

Archived videos should not appear in normal catalogs but can remain in the database for history.

Use archive when:

- A YouTube video was removed.
- Content is outdated.
- You no longer want it shown.

## YouTube API

The first version does not need the YouTube Data API.

Manual curation is better because:

- It avoids API quota limits.
- It avoids extra credentials.
- It gives you control over access levels and descriptions.
- It prevents the site from breaking when a channel feed changes.

Add YouTube API integration later only if you want automatic imports from a playlist or channel.

## Optional Future Import Flow

If automatic import is added later:

1. Admin enters a YouTube playlist ID.
2. Server fetches playlist items from YouTube Data API.
3. Server creates draft video records.
4. Admin reviews title, category, description, and access level.
5. Admin publishes selected records.

Even with imports, the database should remain the final catalog source of truth.

## Content Maintenance Checklist

When adding a video:

- Confirm the YouTube URL opens correctly.
- Extract and store the video ID.
- Add a concise educational description.
- Select a category.
- Choose public or members-only access.
- Set status to draft first.
- Preview the card.
- Publish when ready.

When a YouTube video changes:

- Update the database URL if the video ID changed.
- Archive the record if the video was removed.
- Replace the thumbnail if needed.

## Recommended Disclaimer Near Videos

Add a short disclaimer on video pages and in the footer:

> Videos are for educational purposes only and do not replace clinical judgment, formal training, or institutional protocols.

This matters because the content is medical education.
