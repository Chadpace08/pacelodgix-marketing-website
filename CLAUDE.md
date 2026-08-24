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

## Payments — `payments.js`

The Pricing section has a **Monthly / Yearly switch** and **Subscribe** buttons. Setup steps for Chad are in [PAYMENT-SETUP.md](PAYMENT-SETUP.md) (blocked from serving by the `*.md` rule in `.assetsignore`).

**Currently switched OFF.** `PAYMENT_LINKS` at the top of `payments.js` holds four empty strings. While a slot is empty, that plan's button falls back to `#cta`, relabels itself "Start Free Today", and the GCash/Maya strip stays hidden — so the site is safe to deploy unconfigured and never shows a dead button. Filling the four URLs in is the entire activation step; no other file changes.

Invariants:
- **No card fields on this site, ever.** Every Subscribe button is a plain `<a href>` to the provider's hosted checkout. That is what keeps the site out of PCI scope. Do not add a card form, and never put a secret key in this bundle — the checkout URL is the only payment value that belongs here.
- **Both prices live in the HTML** as `data-monthly` / `data-yearly` on `.pc-amt`. `payments.js` swaps text between them and never computes a price. Change a price and you must change it in **three** places in the same commit: the card's data attributes, the `Offer` JSON-LD in `<head>` (four Offers — monthly and yearly per plan), and the pricing FAQ answer (both the `<details>` and its JSON-LD twin).
- **Enterprise has no `data-plan`** and must not get one — it is quoted per operator.
- **Signup already provisions a tenant.** `trg_auth_user_provision_tenant` on `auth.users` (mig 031) creates the business, the owner role and the seeded defaults when someone signs up with a business name — verified against the live DB. `provision_tenant_for_user()` in the SQL Editor is the *fallback* for a signup that went wrong, not the normal path. See `pms-app/CLAUDE.md` gotcha 25. What is still manual is **reconciling a payment to an account** — nothing tells the app who has paid.

### `.pc-amt` uses `.pc-cur` for the peso sign — not a tag selector
`styles.css` styled the ₱ as `.pc-amt span`, which was safe only while the peso sign was the sole span in the box. Adding `.pc-figure` (the swappable digits) silently pulled the price down to 1.55rem on every card. Both rules — the base one and the one in the mobile breakpoint — are now keyed to `.pc-cur`. **Keep them keyed to the class.** A bare tag selector inside a component captures whatever markup is added later.

## Working Agreements
- Deploy via `npx wrangler deploy` (reads `wrangler.jsonc`). Confirm before deploying — this is the live public site.
- `.assetsignore` controls what's publicly served — check it before adding any new file at the repo root.
- Anything at the repo root is public by default. Never leave loose screenshots or source artwork there.
