# Echoes of Praise

Official choir website for **Echoes of Praise** — a gospel choir based in Nakuru, Kenya.

## Features

- **Home & About** — brand-led storytelling inspired by world-class gospel ministry sites
- **Events** — concert listings, tiered tickets, and direct purchase via M-Pesa STK Push (or partner ticket links such as Zenlipa / Mookh)
- **Give / Lift the Sound** — project fundraiser for a professional sound system with a live progress bar
- **Secure payments** — HTTPS everywhere (Netlify TLS), Safaricom Daraja STK Push via Netlify Functions, HSTS + security headers

## Brand

Colours from the official EoP logo:

| Token | Hex |
|-------|-----|
| Forest green | `#1E5E4A` |
| Muted gold | `#CDB167` |
| Ink | `#0A1210` |

Logo assets live in `/public`.

## Stack

- Vite + React + TypeScript
- React Router
- Netlify (static hosting + serverless functions)

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` when you are ready to test live M-Pesa (sandbox credentials from [Safaricom Daraja](https://developer.safaricom.co.ke/)).

Without credentials, the payment modal runs in **demo mode** and explains that STK Push is not yet wired.

## Netlify deploy

```bash
npm run build
npx netlify deploy --prod
```

Set these environment variables in the Netlify UI:

- `MPESA_ENV` — `sandbox` or `production`
- `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE` / `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL` — `https://<your-site>/api/mpesa-callback`
- Optional: `FUNDRAISER_RAISED_KES` to override the live progress total
- Optional: `VITE_MPESA_PAYBILL` / `VITE_MPESA_TILL` / `VITE_MPESA_ACCOUNT` for manual Lipa na M-Pesa fallback

## Content updates

- Concerts: edit `public/data/events.json` (set `externalTicketUrl` for Zenlipa/Mookh links)
- Fundraiser baseline: edit `public/data/fundraiser.json`

## Licence

Private — Echoes of Praise / MISHAEL.
