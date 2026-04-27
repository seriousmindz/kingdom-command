# 👑 Kingdom Dashboard

**Sovereign Telemetry · Multi-Tenant AI Workforce Cockpit**

Built on Next.js 14 + Supabase + Tailwind. Multi-tenant from day 1. Scales to 1000+ accounts.

> *"Unless the Lord builds the house, those who build it labor in vain."* — Psalm 127:1

---

## Stack

- **Frontend:** Next.js 14 App Router + Tailwind + Editorial Throne Room design system
- **Backend:** Supabase (Postgres + Auth + Realtime + Edge Functions)
- **Auth:** Supabase magic link (passwordless)
- **Multi-tenancy:** Postgres RLS · `account_id` scoping on every table
- **Hosting:** Vercel (production) → `dashboard.seriousmindz.ai`

## Live Database

- **Project ID:** `tlaqntsybxmnqnzrcaav`
- **URL:** `https://tlaqntsybxmnqnzrcaav.supabase.co`
- **Region:** us-east-1
- **Status:** ACTIVE_HEALTHY · 57 entities seeded · 14 accounts live

See `SUPABASE-CREDENTIALS.md` (in `Seriousmindz-Enterprise-Docs/Kingdom-Command/`) for env vars.

## Local development

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase keys (already pre-filled in .env.example)
npm install
npm run dev
```

Open http://localhost:3000 → magic-link login → cockpit loads with all 57 agents live.

## Deploy to Vercel

1. Connect this repo to Vercel
2. Add environment variables from `.env.example`
3. Deploy
4. Point `dashboard.seriousmindz.ai` CNAME at Vercel

## Project structure

```
src/
  app/
    layout.tsx          # Root layout · loads Fraunces/Sora/JetBrains Mono
    page.tsx            # / → redirects based on auth
    globals.css         # Editorial Throne Room theme
    login/page.tsx      # Magic link sign-in
    cockpit/page.tsx    # Founder Bridge (the main dashboard)
    api/auth/callback/  # Supabase auth callback handler
  lib/
    supabase-server.ts  # Server-side Supabase client (cookies)
    supabase-browser.ts # Client-side Supabase client
  middleware.ts         # Refreshes session on every request
supabase/
  migrations/           # SQL migration history
```

## What's already wired

- ✅ Magic-link auth
- ✅ Live cockpit fetches `kingdom_entities`, `entity_heartbeats`, `accounts` from Supabase
- ✅ Token & cost live table (top 10 agents by 24h spend)
- ✅ Properties + Clients lists with status indicators
- ✅ KPI strip computed from real heartbeat data
- ✅ Scripture anchor

## Coming next (Sun-Fri build sprint)

- Heartbeat writer Edge Function
- Approvals tray (⌘A side drawer)
- ⌘K Quick Capture with LLM intent parsing
- Inbox triage with AI categorization
- Per-agent profile pages
- Account switcher with searchable dropdown
- GHL bridge sync
- Stripe MRR sync

## Built for

Craig Sr. · Founder · Seriousmindz AI · Nashville · 2026

— *Work is worship · Customers are image-bearers · The Lord builds the house*
