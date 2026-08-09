# PaceLodgix Marketing Website — CLAUDE.md

## What This Is
Public marketing site for PaceLodgix PMS (`pacelodgix.com`). Separate codebase from `pms-app/` — no shared code, no shared deploy.

**Status:** live

**Brand handover:** [BRAND-UPDATE-HANDOVER.md](BRAND-UPDATE-HANDOVER.md) — logo asset system, what NOT to do with the white-only master artwork. Read before touching branding/logo.
**SEO reference:** [Marketing SEO Prompt.txt](Marketing SEO Prompt.txt)

## Stack — matches root default
| Layer | Choice |
|---|---|
| Frontend | Vanilla HTML + CSS + JS, no build step, no framework |
| Hosting | Cloudflare **Worker with static assets** (`wrangler.jsonc`) — not Pages |

## Brand
- Colors: Deep Forest Green `#1F3A2A` · Warm Cream `#FDFAF0` · Gold `#D9B25F`
- Logo: **white-only master artwork** — invisible on light surfaces. Always check what's behind a logo placement before using the white variant; forest-on-light and white-on-dark cuts already exist in `assets/`. Never stretch to a square box — both mark and wordmark are non-square (1.46:1 and 5.09:1); size by height, `width: auto`.

## Working Agreements
- Deploy via `npx wrangler deploy` (reads `wrangler.jsonc`). Confirm before deploying — this is the live public site.
- `.assetsignore` controls what's publicly served — check it before adding any new file at the repo root.
