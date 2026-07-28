# Echoes of Praise

Official choir website for **Echoes of Praise** — Nakuru, Kenya.

**Live:** https://thriving-klepon-4f8cc0.netlify.app/

## Features

- Cinematic public site (brand green `#1E5E4A` + gold `#CDB167`) with choir photography
- **Events** — upcoming / past, free or paid tickets
- **Ticketing** — M-Pesa for paid events + attendee analytics (city, county, age, attribution)
- **Gallery** — photos from admin / seeded Drive set
- **Give** — ongoing support + campaign fundraisers (optional progress)
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
2. Authentication → create an email/password user for admin
3. Confirm `profiles` has that user with `role = admin` (auto-created by trigger)
4. Add to **Netlify → Site configuration → Environment variables** (then redeploy):

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Project anon/public key |
| `VITE_ADMIN_DEMO_PASSWORD` | (optional; only for local demo) |

Optional M-Pesa (Netlify Functions):

| Variable | Notes |
|----------|--------|
| `MPESA_ENV` | `sandbox` or `production` |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | Daraja |
| `MPESA_SHORTCODE` / `MPESA_PASSKEY` | Paybill / till |
| `MPESA_CALLBACK_URL` | `https://YOUR_DOMAIN/api/mpesa-callback` |

5. Authentication → URL configuration: add your Netlify URL (and custom domain later) under **Site URL** and **Redirect URLs**.

Without Supabase env vars the site still shows seeded content; admin writes stay local to the browser.

## Content

- Gallery images: `public/images/gallery/eop-01.jpg` … `eop-16.jpg`
- Hero: `public/images/choir-main.jpg`
- Edit concerts / funds / gallery in `/admin` once Supabase is connected

## Licence

Private — Echoes of Praise / MISHAEL.
