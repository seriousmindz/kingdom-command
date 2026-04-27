# 🚀 PUSH TO GITHUB · 90-second handoff

Codebase is built. Sandbox can't push from inside. You push from your Mac Terminal — 3 commands.

---

## Option A · `gh` CLI (if you have GitHub CLI authenticated)

```bash
cd "/Users/parkingguysseriousmindzai/Documents/Claude/Projects/God Is My Strenght/kingdom-dashboard-app"

# Clean up any half-written git internals from the sandbox attempt
rm -rf .git

# Fresh init + commit + create private repo + push — all in one go
git init -b main
git add -A
git commit -m "Kingdom Dashboard v0.1 · initial scaffold · The Lord builds the house"
gh repo create kingdom-dashboard --private --source=. --remote=origin --push
```

That's it. Done. Repo lives at `https://github.com/<your-user>/kingdom-dashboard`.

---

## Option B · Manual (if `gh` isn't installed)

**Step 1** — On github.com, click **+ → New repository**
- Owner: your account
- Name: `kingdom-dashboard`
- Visibility: **Private**
- Do NOT initialize with README/gitignore (we have them)
- Click Create

**Step 2** — Copy the URL it gives you (something like `git@github.com:craig/kingdom-dashboard.git`)

**Step 3** — In Terminal:

```bash
cd "/Users/parkingguysseriousmindzai/Documents/Claude/Projects/God Is My Strenght/kingdom-dashboard-app"
rm -rf .git
git init -b main
git add -A
git commit -m "Kingdom Dashboard v0.1 · initial scaffold · The Lord builds the house"
git remote add origin <PASTE-URL-HERE>
git push -u origin main
```

---

## Option C · `gh auth login` first if needed

If `gh` says you're not authenticated:

```bash
gh auth login
# Pick: GitHub.com → HTTPS → Yes (auth git with your GitHub credentials) → Login with browser
# Follow browser prompts. Done.

# Then run Option A.
```

---

## After push: connect Vercel (~3 min)

1. Go to https://vercel.com/new
2. Import the `kingdom-dashboard` repo
3. Framework: **Next.js** (auto-detected)
4. Add environment variables (all 3 from `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL` → `https://tlaqntsybxmnqnzrcaav.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → (the long JWT in .env.example)
5. Deploy
6. Vercel gives you a `*.vercel.app` URL → open it → magic-link login → see live cockpit

---

## After Vercel: point your domain

In your DNS provider for `seriousmindz.ai`:
- Add CNAME: `dashboard` → `cname.vercel-dns.com`
- In Vercel → Settings → Domains → Add `dashboard.seriousmindz.ai`

Live at `https://dashboard.seriousmindz.ai` in ~2 minutes.

---

## Verify before push (optional sanity check)

```bash
cd "/Users/parkingguysseriousmindzai/Documents/Claude/Projects/God Is My Strenght/kingdom-dashboard-app"
ls -la
# Should see: package.json, next.config.mjs, src/, .env.example, README.md, .gitignore, etc.
```

If `node_modules` exists somehow, that's fine — it's gitignored.

---

## Test locally before deploying (optional)

```bash
cd "/Users/parkingguysseriousmindzai/Documents/Claude/Projects/God Is My Strenght/kingdom-dashboard-app"
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 → log in → see the live cockpit pulling from Supabase.

---

> **The Lord builds the house** · Sleep first. Tomorrow morning you wake, run the push, deploy, and `dashboard.seriousmindz.ai` is live. — Ezra · 06:35 UTC · Apr 26 2026
