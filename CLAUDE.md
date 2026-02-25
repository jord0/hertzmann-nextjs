# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Next.js build (no prebuild step; no DB required at build time)
npm run lint      # ESLint
```

There are no tests. The build no longer requires a live DB connection — browse data is fetched at request time via `unstable_cache`.

## Architecture

### Data pipeline

Data flows in two distinct modes:

**Browse page (`/photographs`):** Server Component. Calls `getBrowseData()` from `lib/browse-data.ts`, which uses `unstable_cache` (tag: `browse-data`) to cache the photographer list and keyword list. The cache is invalidated by admin actions via `revalidateTag('browse-data')`. `data.json` and `scripts/generate-data.ts` are retired.

**At request time:** Individual photographer, subject, and photo detail pages query the Railway MySQL database directly via `lib/db.ts`. Each call opens a new connection, runs the query, and closes it (no pooling).

This means:
- `/photographs` (browse page) — async Server Component, cached DB query via `unstable_cache`
- `/photographs/photographer/[slug]` — SSG via `generateStaticParams`, DB query at build + runtime fallback
- `/photographs/subject/[keyword]` — same pattern
- `/photographs/photo/[id]` — dynamically rendered (uses `searchParams`), DB queries every request

### Database schema

**`photographers` table**
| column | type | notes |
|---|---|---|
| `id` | int PK | |
| `firstName` | varchar | |
| `lastName` | varchar | |
| `years` | varchar | may contain HTML entities (`&ndash;`) |
| `country` | varchar | |
| `enabled` | tinyint | 1 = visible on site |

**`photos` table**
| column | type | notes |
|---|---|---|
| `id` | int PK | |
| `photographerId` | int FK | references `photographers.id` |
| `title` | varchar | |
| `medium` | varchar | |
| `date` | varchar | |
| `width` | varchar | |
| `height` | varchar | |
| `price` | varchar | |
| `description` | text | |
| `provenance` | text | |
| `inventoryNumber` | varchar | |
| `keywords` | varchar | pipe-delimited with leading/trailing pipes: `\|kw1\|kw2\|` |
| `enabled` | tinyint | 1 = visible on site |

### Admin panel

Located at `/admin/*`. Protected by `middleware.ts` using `iron-session`.

**Authentication:**
- Session managed by `iron-session` (`lib/session.ts`)
- Password stored as a bcrypt hash in `ADMIN_PASSWORD_HASH` env var
- Session secret in `ADMIN_SESSION_SECRET` env var (32+ char string)
- Login: `POST /api/admin/login` — bcrypt compare, set session cookie
- Logout: `POST /api/admin/logout` — clear session, redirect to login
- Middleware protects all `/admin/*` except `/admin/login`

**Revalidation rules:**

| Admin action | Cache busted |
|---|---|
| Add/toggle photographer | `revalidateTag('browse-data')` |
| Edit photographer name | + `revalidatePath('/photographs/photographer/[old-slug]')` |
| Add/toggle photo | `revalidateTag('browse-data')` + `revalidatePath('/photographs/photographer/[slug]')` |
| Edit photo | Same as above |
| New keyword added | `revalidateTag('browse-data')` (new subject page renders on-demand) |

**Required env vars:**
```
ADMIN_PASSWORD_HASH=   # bcrypt hash, generate with: node -e "require('bcryptjs').hash('yourpassword',10).then(console.log)"
ADMIN_SESSION_SECRET=  # 32+ char random string
```

### SFTP image upload

Images for new photos are uploaded directly to the Hurricane Electric server via SFTP from the browser (through `/api/admin/upload`).

- Package: `ssh2-sftp-client`
- Upload logic: `lib/sftp.ts` — connects, uploads buffer to `{HE_SFTP_REMOTE_PATH}/{photographerId}_{photoId}.jpg`, disconnects
- API route: `app/api/admin/upload/route.ts` — verifies session, parses `formData`, calls `uploadPhotoToHE()`
- Images served from `https://hertzmann.net/pages/photos/{photographerId}_{photoId}.jpg`

**Required env vars:**
```
HE_SFTP_HOST=
HE_SFTP_USER=
HE_SFTP_PASSWORD=
HE_SFTP_REMOTE_PATH=   # e.g. /public_html/pages/photos
```

### Photo images

Images are served from the legacy site: `https://hertzmann.net/pages/photos/{photographerId}_{photoId}.jpg`. There is no local image storage. Missing images fail silently; `enabled = 1` in the DB is the gating condition, not filesystem presence.

### Contextual navigation on photo detail

`/photographs/photo/[id]` accepts a `from` query param that drives both the back link and prev/next navigation:
- `?from=photographer/ansel-adams` — navigates within that photographer's photos
- `?from=subject/landscape` — navigates within that subject's photos

All links to the detail page must include the appropriate `from` param. The param is URL-encoded and carried forward through prev/next links.

### Styling

All styling uses inline React style objects. Tailwind is installed but not used for component styling — only for the global CSS reset via `@import "tailwindcss"` in `globals.css`. Do not introduce Tailwind utility classes on components; keep inline styles for consistency.

For responsive layouts, use a `<style>` tag with a media query inside the component (see `app/photographs/photo/[id]/page.tsx` for the pattern).

### Design tokens

All design values live in `lib/design-tokens.ts`. Import and use `tokens` — never hardcode hex colors or repeat raw values inline.

```ts
import { tokens } from '@/lib/design-tokens';
```

**Key tokens:**
- `tokens.color.gold` — `#F0B23C` (accent, rules, highlights)
- `tokens.color.foreground` — `#2a2a2a` (primary text)
- `tokens.color.muted` — `#666666` (secondary text)
- `tokens.color.dark` — `#1a1a1a` (CTA section background only — not for text)
- `tokens.color.bg` — `#ffffff`
- `tokens.color.bgWarm` — `#faf8f4` (caption bars, warm backgrounds)
- `tokens.color.borderWarm` — `#e8e0d0`
- `tokens.font.serif` — `'var(--font-cormorant)'` (Cormorant, headings)
- `tokens.font.sans` — `'var(--font-inter)'` (Inter, body/nav)
- `tokens.fontWeight.light` — `300` (body text default)
- `tokens.fontWeight.medium` — `500` (labels, nav links)
- `tokens.fontWeight.semibold` — `600` (headings)

**Typography scale:**
- Display / section headings: Cormorant 600, 2.75rem+
- Sub-headings: Cormorant 600, 1.5rem
- Body: Inter 300, 1rem / 1.8 line-height
- Caps labels / nav: Inter 500, 0.75–0.8rem, `0.08–0.12em` letter-spacing, uppercase

**Section anatomy:**
- Content sections: `padding: tokens.section.padding` (`'5rem 2.5rem'`), `maxWidth: tokens.section.maxWidth` (`'1100px'`), `margin: '0 auto'`
- Full-bleed colored bands: no maxWidth, `width: '100%'`

**Design reference:** `_prototype/theme.css` is the designer's source of truth. `lib/design-tokens.ts` is the developer's port of it. Do not edit `_prototype/` files — they are reference only.

### `useSearchParams` requires Suspense

Any client component that calls `useSearchParams()` must be wrapped in a `<Suspense>` boundary. The pattern used here is a thin exported wrapper that renders the real component inside `<Suspense>` (see `app/photographs/page.tsx`).

### HTML entities in DB data

Photographer `years` and other fields can contain HTML entities (`&ndash;`, `&rsquo;`, etc.) from the legacy system. Always pass these through `decodeHtmlEntities()` from `lib/htmlDecode.ts` before rendering.

### Photographer slugs

Slugs are not stored in the database — they are generated on the fly from `firstName` and `lastName`. The generation logic must stay consistent across all files that use it:
```ts
`${firstName || ''}-${lastName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/^-+|-+$/g, '')
```

### Deployment

Deployed on Vercel, connected to `github.com/jord0/hertzmann-nextjs`. Pushing to `main` triggers a production deployment. The build does **not** require a DB connection — browse data is fetched and cached at runtime. The Railway DB must be reachable from Vercel's runtime environment (not build environment) for the site to function.
