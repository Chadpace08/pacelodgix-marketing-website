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

## Stylesheet Order — read before editing any CSS
`index.html` loads **two** stylesheets, in this order:

1. `styles.css` — the original design, still complete and untouched.
2. `redesign.css` — the 2026 redesign (rounds 3–14), loaded **after** and overriding it. Light hero, 16-card feature mosaic, Inter for display type, background grids off.

Because `redesign.css` loads second, it wins. Two consequences:
- **Editing a rule in `styles.css` may do nothing** if `redesign.css` overrides it. Check there first.
- If a block is ever folded from `redesign.css` into `styles.css`, **delete it from `redesign.css` in the same pass** — a stale duplicate silently overrides the newer value with an older one, and the two look nearly identical.

Deleting the `redesign.css` `<link>` and the `redesign.js` `<script>` returns the previous design intact. `redesign.js` drives the feature grid's scroll drift and pointer light only; both are enhancements.

`preview.html` is the old review lane. It is noindex, blocked in `.assetsignore`, and now renders the same design as `index.html` — safe to delete once the redesign is settled.

## Working Agreements
- Deploy via `npx wrangler deploy` (reads `wrangler.jsonc`). Confirm before deploying — this is the live public site.
- `.assetsignore` controls what's publicly served — check it before adding any new file at the repo root.
- Anything at the repo root is public by default. Never leave loose screenshots or source artwork there.
