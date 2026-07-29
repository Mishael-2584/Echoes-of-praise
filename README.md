# Echoes of Praise

Official choir website for **Echoes of Praise** — Nakuru, Kenya.

**Live:** https://thriving-klepon-4f8cc0.netlify.app/ (custom domain: [echoesofpraize.com](https://echoesofpraize.com))

## Features

- Cinematic public site (brand green `#1E5E4A` + gold `#CDB167`) with choir photography
- **Events** — upcoming / past, free or paid tickets
- **Ticketing** — M-Pesa for paid events + attendee analytics (city, county, age, attribution)
- **Gallery** — photos from admin / seeded Drive set
- **Give** — ongoing support + campaign fundraisers (optional progress)
- **Members** — leadership, conductors, instrumentalists, A–Z roster
- **Admin** — `/admin` for events, gallery, fundraisers, tickets
- **Supabase** backend + **Netlify** hosting

## Local development

```bash
npm install
cp .env.example .env   # then fill Supabase keys
npm run dev
```

- Site: http://localhost:5173/
- Admin demo (no Supabase): http://localhost:5173/admin/login — password `echoes-admin`

## Supabase setup (required for production)

1. Create a project and run, in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_storage.sql`
   - `supabase/migrations/003_gallery_seed.sql` (optional)
   - `supabase/migrations/004_one_concert.sql` (ONE Concert + fundraiser)
   - `supabase/migrations/005_ensure_admin_profiles.sql` (after creating Auth users)
2. Authentication → create email/password user(s) for admin
3. Run `005_ensure_admin_profiles.sql` so each Auth user gets `profiles.role = admin`
4. Add to **Netlify → Site configuration → Environment variables** (then redeploy):

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) from **API Keys** |

> Prefer the new **publishable** key. Legacy `anon` JWT keys still work during the migration window but are [scheduled for deprecation by end of 2026](https://supabase.com/docs/guides/getting-started/api-keys). Optional fallback env: `VITE_SUPABASE_ANON_KEY`.

Never put a **secret** key (`sb_secret_...`) or legacy `service_role` in Vite/`VITE_*` — those bypass RLS and must stay server-side only.

Optional M-Pesa (Netlify Functions):

| Variable | Notes |
|----------|--------|
| `MPESA_ENV` | `sandbox` or `production` |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | Daraja |
| `MPESA_SHORTCODE` / `MPESA_PASSKEY` | Paybill / till |
| `MPESA_CALLBACK_URL` | `https://YOUR_DOMAIN/api/mpesa-callback` |

5. Authentication → URL configuration: add your Netlify URL (and `https://echoesofpraize.com`) under **Site URL** and **Redirect URLs**.

Contact: [hello@echoesofpraize.com](mailto:hello@echoesofpraize.com)

Without Supabase env vars the site still shows seeded content; admin writes stay local to the browser.

## Content

- Gallery images: `public/images/gallery/eop-01.jpg` … `eop-16.jpg`
- Hero: `public/images/choir-main.jpg`
- Edit concerts / funds / gallery in `/admin` once Supabase is connected

## Licence

Private — Echoes of Praise / MISHAEL.
