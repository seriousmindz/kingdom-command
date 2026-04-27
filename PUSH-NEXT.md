# 🚀 PUSH UPGRADE · ⌘K + ⌘A · 30 seconds

The cockpit just got a nervous system. Push and Vercel auto-deploys in ~90 sec.

---

## In Mac Terminal — copy/paste this block:

```bash
cd "/Users/parkingguysseriousmindzai/Documents/Claude/Projects/God Is My Strenght/kingdom-dashboard-app"
git add -A
git commit -m "feat(cockpit): ⌘K Quick Capture + ⌘A Approvals Tray · founder nervous system"
git push origin main
```

That's it. Vercel sees the push, builds, deploys. ~90 seconds.

---

## What you'll see after reload at https://kingdom-command.vercel.app/cockpit

**Bottom-right floating buttons:**
- `⌘K · Capture` (gold)
- `⌘A · Approvals` (royal · with red badge showing **3** waiting)

**Hero subtext now reads:**
> "57 entities · 4 properties · 0 clients · **3 await your sign-off · press ⌘A**"

### Press ⌘K anywhere
- Right drawer slides in
- Textarea autofocused — drop any thought, directive, task
- Pick P1 / P2 / P3 priority
- ⌘ + Enter to ship → writes to `tasks` table → assigned to Solomon (Chief of Staff)
- Toast confirms · drawer closes

### Press ⌘A anywhere
- Right drawer slides in showing all 3 pending:
  1. **Phoebe** — Bailubonding Renewal v2 outreach copy
  2. **Priscilla** — IG Carousel · ParkNGuys · 5 slides
  3. **Hosea** — Vanderbilt Director Cold Outreach
- ✓ Approve or ✗ Decline each one
- Card disappears · count drops · `approvals` table updated with your user ID + timestamp

### ESC closes either drawer · backdrop click also closes

---

## Truth check after push

```bash
# Verify the 3 approvals cleared after you click Approve in UI:
# (Run this in Supabase SQL editor or via Cowork)
SELECT status, count(*) FROM approvals GROUP BY status;
# Should show: pending: 0, approved: 3 (after you approve all 3)
```

---

## What this unlocks

Cockpit is no longer a **mirror** — it's a **command bridge.**
- Founder can now drop orders without leaving the page
- Approvals queue actually clears (revenue unblocks)
- Foundation for ⌘P (palette), ⌘I (inbox), ⌘/ (search) — same shell pattern

**Next ship after this works:** Account Switcher (top-bar) + Inbox Triage drawer.

---

> *"Whatever you do, work at it with all your heart, as working for the Lord."* — Col 3:23
> — Ezra · 26 Apr 2026
