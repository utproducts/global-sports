# Global Sports

The worldwide adult slow-pitch championship program. Global landing → pick your country → country microsite, all on one Next.js app over the shared Supabase backend.

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Postgres + Auth + RLS) — Europe-DC-Render project, EU region
- **Stripe** (added in a later phase) — single processor, per-country currency/VAT
- **jsVectorMap** — interactive world map on the landing

## Routes
- `/` — global landing + world-map country selector
- `/[region]` — region home (e.g. `/europe`)
- `/[region]/[country]` — country microsite shell (e.g. `/europe/de`)

In production, region subdomains (`europe.globalsports.com`) are rewritten to `/[region]` by `middleware.ts`.

## Run locally
```bash
npm install
cp .env.example .env.local   # already provided with the Supabase URL + publishable key
npm run dev                  # http://localhost:3000
```

## Environment
See `.env.example`. The Supabase **publishable/anon** key is browser-safe (protected by RLS).
Never commit `.env.local` or any Stripe **secret** key — `.gitignore` already excludes env files.

## Deploy (Cloudflare Pages)
1. Push to GitHub (see below).
2. In Cloudflare Pages, connect the repo, framework preset **Next.js**.
3. Add the env vars from `.env.example` in the Pages project settings.
4. Add the apex domain + a wildcard (`*.globalsports.com`) so region subdomains resolve.

## Push to GitHub
```bash
git remote add origin git@github.com:<you>/global-sports.git
git branch -M main
git push -u origin main
```
