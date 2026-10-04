# PaceLodgix Marketing Website

## What This Is
Public marketing site for PaceLodgix PMS (`pacelodgix.com`). Separate codebase from `pms-app/`, no shared code, no shared deploy.

**Status:** live

**Brand handover:** [BRAND-UPDATE-HANDOVER.md](BRAND-UPDATE-HANDOVER.md), logo asset system, what NOT to do with the white-only master artwork. Read before touching branding/logo.
**SEO reference:** [Marketing SEO Prompt.txt](Marketing SEO Prompt.txt)

## Stack (matches root default)
| Layer | Choice |
|---|---|
| Frontend | Vanilla HTML + CSS + JS, no build step, no framework |
| Hosting | Cloudflare **Worker with static assets** (`wrangler.jsonc`), not Pages |

## Brand
- Colors: Deep Forest Green `#1F3A2A` · Warm Cream `#FDFAF0` · Gold `#D9B25F`
- Logo: **white-only master artwork**, invisible on light surfaces. Always check what's behind a logo placement before using the white variant; forest-on-light and white-on-dark cuts already exist in `assets/`. Never stretch to a square box, both mark and wordmark are non-square (1.46:1 and 5.09:1); size by height, `width: auto`.

## The 2026 redesign is LIVE (since 4 Oct 2026): READ FIRST
Lodgify-style, mobile-first rebuild of `index.html`. **Deployed to pacelodgix.com on 4 Oct 2026**, on Chad's instruction (version `033c17aa`). That instruction replaced his earlier rule of holding the redesign until every asset was ready.

- **Two folders, one repo, same commit.** `marketing-website/` is branch `main`, `marketing-website-redesign/` is a worktree on `redesign-2026-10`. How a change goes live: edit and commit in the redesign folder (the `backups/` copies and the source pictures live there, on this computer only), then in `marketing-website/` run `git merge --ff-only redesign-2026-10`, then `npx wrangler deploy` **from `marketing-website/`**, then push both branches. Keep the two branches on the same commit.
- **The GitHub repo is public.** Never commit full-size source pictures, customer photos or backups: `.gitignore` keeps `backups/`, `carolen.png`, `Host Christy.jpg` and `PaceLodgix Dashboard Hero.png` out.
- **Going back:** the last version of the old design is the git tag `live-before-redesign-2026-10`. `npx wrangler rollback` also returns the site to the previous upload.
- **Still open after going live:** the hero's two pictures are different captures (see Known gap below); screenshots still show the old logo in places; whether Yen and Xty gave written OK for their photos is not recorded here (Chad supplied the photos and chose to go live).

- **Wording is locked.** Every line of copy is the live site's wording, word for word. Add new text if asked; never reword existing lines. Approved changes so far: hero subline shortened to "built for Philippine short-term rentals."; "PaceLodgix" to "Pace Lodgix"; onboarding section (30 Sep 2026) reworded with no "we"/"team" and "All plans" instead of plan names (Chad works solo).
- `index.html` loads **one** stylesheet, `site.css`, and two scripts: `site.js` (menus, hero picture drift, product list on desktop, phones, appearance fade on scroll) and `payments.js` (unchanged, see below). `styles.css`, `redesign.css`, `nav.js`, `scroll.js`, `parallax.js`, `redesign.js` are no longer used by `index.html`; `privacy.html` and `terms.html` still use `styles.css` until they are moved over.
- `site.css` is mobile first: base rules are the phone, `@media (min-width: 640px)` tablet, `(min-width: 900px)` desktop. Colours are tokens on `:root` (forest, cream, gold). Later rules in the file override earlier ones.
- Icons: an inline SVG sprite at the top of `<body>` (Tabler outline, MIT), shown as `<span class="bi"><svg><use href="#i-NAME"/></svg></span>`, gold on a forest tile. To add one, copy the paths of `D:\CLAUDE CODE\Saas Icons\tabler icons\tabler\outline\NAME.svg` into a new `<symbol id="i-NAME">`.
- Hero picture (`#heroVisual`, classes `.hv-*`), changed 4 Oct 2026 at Chad's request. It replaced the tabbed, swipeable `#stage` (backup in `backups/v-before-hero-devices/`). The hero text block was not touched. What it is: the **light** desktop dashboard in a browser frame, a phone in front showing the **night-mode** dashboard that scrolls by itself. **No feature cards**: three floating cards were tried and removed the same day, because Chad found they repeated the hero bullets. Do not add text on top of the picture again without asking.
  - Pictures: `assets/shots/hero-dashboard-light.webp` (+ `-960`), exported from `PaceLodgix Dashboard Hero.png` at the folder root (blocked in `.assetsignore`), and `assets/shots/hero-dashboard-night-mobile.webp`, exported from the portfolio's `mobile-dashboard.png` and cut off after "Bookings by Channel".
  - Motion is CSS: `hvPanDown` + `hvPanUp` scroll the phone screen (two halves of one move, keep their timing identical), `hvFloat` bobs the phone. `site.js` only writes `--mx`, `--my`, `--sy` on `.hv`; each layer's `--dx` / `--dy` decides how far it drifts. All of it is off under reduced motion.
  - Known gap: the two pictures are different captures, so the figures differ (desktop is Oct 2026 demo data, phone is Jul 2026) and the phone's Calendar Connections card reads "Never / Disabled" as it scrolls past. A fresh night-mode phone capture of the same demo account would fix both.
- Product (`#showcase`): desktop (900px and up) is a clickable list beside one card. Below 900px the seven cards stack down the page, each only as tall as its words and picture (changed 4 Oct 2026, evening).
  - Every card shows the **desktop** screenshot at every width (Chad's request). Below 900px the **whole** screenshot is fitted to the card width: nothing cut, nothing moving. The earlier phone layout (section pinned, cards sliding sideways on scroll, picture enlarged to fill the card and gliding left and right) was removed because it cut most of each picture and card 04 looked empty; backup in `backups/v-before-showcase-whole-picture/`. Do not bring back the pin, the glide, or a card that stretches to fill the screen: Chad wants no empty space and nothing cut, and a wide picture in a tall card cannot give both.
  - Card 04 (Booking form) only: below 640px a `<source>` swaps in `assets/shots/app/booking-form-phone.webp`, the same capture with the blank side margins trimmed (800 x 787, cut from x 395 to 1195). If `booking-form.webp` is re-captured, re-cut this one too.
  - The phone crops in `assets/shots/phone/` are not used by `index.html`.
- Marketing Center (`#marketing-center`): the four app pictures in `.mcard` carry a thin 1px border (`#D8D2BF`) so a white screenshot does not blend into the cream behind it (Chad, 4 Oct 2026).
- Phone bottom bar (`.sticky`, below 900px only): **Sign in** and **Request a demo** (Chad, 4 Oct 2026). The second button used to be "Start free trial"; it now jumps to the demo form at `#cta`, which has `scroll-margin-top` so the heading lands clear of the fixed header. The header and the other "Start free trial" buttons on the page were not changed.
- Deposits and payments (`#payments`): words only since 4 Oct 2026, Chad asked for the picture to be removed (`.frow.solo`).
- The old way (`#problem`): the three pain cards live in `#pains`. Each has a Tabler icon (calendar-exclamation, messages, calculator) drawn in the tag's soft red, not the usual gold on forest, because the section is about problems. `site.js` sets `--p` (0 to 1) on each card from the scroll position; `site.css` turns it into the rise, the fade, the red accent drawing itself and the icon settling. Side by side, each card starts a little after the one before it. Added 4 Oct 2026 at Chad's request; the wording on the cards was not changed.
- Host photos, 4 Oct 2026: Chad supplied `carolen.png` (Yen Escarpe, JDN Beach Resort) and `Host Christy.jpg` (Xty Pua, Lucky Koi SMDC), both at the folder root and blocked in `.assetsignore`. The page uses small square crops, `assets/people/yen-escarpe.webp` and `assets/people/xty-pua.webp`, in the two testimonial cards and beside Yen's quote in The old way. Names on the page stay "Yen Escarpe" and "Xty Pua". Whether each host has given written OK to show a photo is not recorded here; confirm with Chad before going live.
- Walkthroughs (`#tour`), 4 Oct 2026: two groups, **Desktop video** (YouTube `K23PL4oOhB8`, "Pace Lodgix Desktop Tour", 16:9) and **Mobile video** (YouTube `xCjIOFZFgd4`, "Pace Lodgix Phone Tour", upright 9:16). Both are **unlisted** on the Pace Digital Works channel and allow embedding. The page shows a cover picture and a play button; `site.js` loads the YouTube player (youtube-nocookie.com) only after a tap, and with no script the cover is a plain link to YouTube. Covers are our own screenshots, not YouTube's thumbnails (the desktop video's auto thumbnail shows a `localhost:3000` link). Side by side on desktop at equal height (column ratio 3.16 to 1), stacked below 900px. The demo video placeholder is gone. The two old clips ("The command center", "A day of operations") and their four files in `assets/video/` were deleted on 4 Oct 2026 at Chad's request, as outdated; git still has them. `preview.html` (the unused, blocked review page) still points at them.
- Appearance (`#appearance`): no Light / Night Dim buttons (Chad, 4 Oct 2026). The live site's effect is back: the Night Dim screenshot lies over the Light one in `#dimStage` and `site.js` raises `--dim-mix` from 0 to 1 as the section scrolls. Both pictures must be the same capture in two modes (`dashboard-light-desktop.webp`, `dashboard-dim-desktop.webp`), or the fade shows two different screens.
- On the go (`#mobile`): the tall dashboard screenshot scrolls inside the front phone (`panPhone()` in `site.js`).
- Pricing card look (4 Oct 2026, Chad's request): Starter and Enterprise are white with a dark outline, Growth (`.plan.pop`) is the dark green card with light text and a gold button. Colours only, in `site.css`; no markup changed.
- Pricing keeps the exact markup `payments.js` needs: `#billingToggle`, `.price-grid`, `.pc-amt[data-monthly][data-yearly]` with `.pc-figure` and `.pc-period`, `.pc-save`, `[data-plan]` buttons, `#payMethods`. Do not rename any of them.
- New assets: `assets/shots/phone/` (phone crops), `assets/brand/` (3D WhatsApp and Messenger icons), `assets/hero-villa.webp` (the old hero backdrop, from `og-image.jpg`; no longer used by `index.html` since 4 Oct 2026).

## Stylesheet Order of the OLD design (no longer what `index.html` loads; kept because `privacy.html` and `terms.html` still use `styles.css`)
`index.html` loads **two** stylesheets, in this order:

1. `styles.css`, the original design, still complete and untouched.
2. `redesign.css`, the 2026 redesign (rounds 3-14), loaded **after** and overriding it. Light hero, 16-card feature mosaic, Inter for display type, background grids off.

Because `redesign.css` loads second, it wins. Two consequences:
- **Editing a rule in `styles.css` may do nothing** if `redesign.css` overrides it. Check there first.
- If a block is ever folded from `redesign.css` into `styles.css`, **delete it from `redesign.css` in the same pass**, a stale duplicate silently overrides the newer value with an older one, and the two look nearly identical.

Deleting the `redesign.css` `<link>` and the `redesign.js` `<script>` returns the previous design intact. `redesign.js` drives the feature grid's scroll drift and pointer light only; both are enhancements.

`preview.html` is the old review lane. It is noindex, blocked in `.assetsignore`, and now renders the same design as `index.html`, safe to delete once the redesign is settled.

## Payments, `payments.js`

The Pricing section has a **Monthly / Yearly switch**. Setup steps are in [PAYMENT-SETUP.md](PAYMENT-SETUP.md) (blocked from serving by the `*.md` rule in `.assetsignore`).

**Live, yearly only.** PayMongo payment links are one-time charges, not subscriptions, so:
- **Yearly** buttons carry a real PayMongo link (`PAYMENT_LINKS.*.yearly` in `payments.js`), read "Pay for 1 year", and each is a single charge covering 12 months. Renewal is a manual reminder email from Chad.
- **Monthly** is not self-serve. `PAYMENT_LINKS.*.monthly` is left empty on purpose, so the monthly button routes to `#cta` and reads "Contact us". Do **not** fill these with one-time links.
- The GCash/Maya strip shows on the yearly view only (keyed off `data-unconfigured`).
- Real recurring billing needs **PayMongo Subscriptions** (API integration; cards + Maya only, GCash by arrangement). Future build, not done.

Invariants:
- **No card fields on this site, ever.** Every Subscribe button is a plain `<a href>` to the provider's hosted checkout. That is what keeps the site out of PCI scope. Do not add a card form, and never put a secret key in this bundle, the checkout URL is the only payment value that belongs here.
- **Both prices live in the HTML** as `data-monthly` / `data-yearly` on `.pc-amt`. `payments.js` swaps text between them and never computes a price. Change a price and you must change it in **three** places in the same commit: the card's data attributes, the `Offer` JSON-LD in `<head>` (four Offers, monthly and yearly per plan), and the pricing FAQ answer (both the `<details>` and its JSON-LD twin).
- **Enterprise has no `data-plan`** and must not get one, it is quoted per operator.
- **Signup already provisions a tenant.** `trg_auth_user_provision_tenant` on `auth.users` (mig 031) creates the business, the owner role and the seeded defaults when someone signs up with a business name, verified against the live DB. `provision_tenant_for_user()` in the SQL Editor is the *fallback* for a signup that went wrong, not the normal path. See `pms-app/CLAUDE.md` gotcha 25. What is still manual is **reconciling a payment to an account**, nothing tells the app who has paid.

### `.pc-amt` uses `.pc-cur` for the peso sign, not a tag selector
`styles.css` styled the ₱ as `.pc-amt span`, which was safe only while the peso sign was the sole span in the box. Adding `.pc-figure` (the swappable digits) silently pulled the price down to 1.55rem on every card. Both rules, the base one and the one in the mobile breakpoint, are now keyed to `.pc-cur`. **Keep them keyed to the class.** A bare tag selector inside a component captures whatever markup is added later.

## Working Agreements
- Deploy via `npx wrangler deploy` (reads `wrangler.jsonc`). Confirm before deploying, this is the live public site.
- `.assetsignore` controls what's publicly served, check it before adding any new file at the repo root.
- Anything at the repo root is public by default. Never leave loose screenshots or source artwork there.

## The "Coming Soon: Marketing Center" section is WRONG, do not trust it (Sep 2026)
`index.html` (around line 1030, `id="marketing-center"`) carries an HTML comment claiming "none of this is built" and shows a "Coming soon" chip cloud (email campaigns, coupon codes, guest promotions, seasonal discounts, customer database, landing pages). **That comment is stale and the section is inaccurate.** Checked directly against `pms-app/CLAUDE.md` (Sep 2026):

| Claimed as "coming soon" | Actual status |
|---|---|
| Email campaigns to past guests, segmented, with merge tags | **Live**, `campaigns.html`, full send/results/click-tracking pipeline |
| Coupon codes | **Live**, migs 041-043 |
| Guest promotions / seasonal discounts | **Live**, `discounts` table, auto-applied |
| Customer/guest database | **Live**, `customers.html` |
| Landing pages / own website | **Live and more advanced than implied**, full Website Builder, 5 themes, published guest site at `stay.pacelodgix.com/<slug>` |
| Referral campaigns | **Not built.** "Referral" today is only a manual booking-source label, no tracking/reward system exists |
| Lead capture | **Not built**, no evidence of this anywhere in the app |

**Do not rewrite this section as a "coming soon" teaser again without re-checking `pms-app/CLAUDE.md`'s Current Phase Status first.** Almost the entire marketing suite is real, live, shipped product, it needs a real feature showcase (screenshots from `campaigns.html`, `customers.html`, `stay.html`), not a placeholder chip cloud. `PaceLodgix-Full-Feature-Script.md` (one level up) already documents this correctly in its Sections 10-11, that file was never wrong, only this website section was.

## Copy and Language Rules

Voice for this site is **Part 2** of `00-Knowledge-Base/standards/communication-standard.md`: friendly, clear, practical, specific. It is a marketing site, not an app screen, so do **not** flatten it into Part 3 label copy and do not make it corporate.

Hard rules, enforced by `.claude/hooks/language-guard.js` on every write:

- **No em-dash and no en-dash anywhere**, including HTML comments and JS comments. Use a full stop, comma, colon or brackets. A normal hyphen for number ranges (`1-3 properties`) is fine. The whole site was cleaned of 143 of them on 17 Sep 2026; do not reintroduce one.
- **Banned filler:** "simply", "just", "easily", "easy-to-use", "effortlessly", "seamlessly", "conveniently", "click here".
- **Numbered showcase labels use a middot** (`01 · Dashboard`), matching the rest of the site's separators.

Terminology, one word per thing:

- The product is **Pace Lodgix** (with a space) in all customer-facing copy, including `alt` text.
- The `#showcase` section is called **Product** in the nav, the mobile panel and the footer. Change all three together or not at all.

**The FAQ and its JSON-LD twin must stay in sync.** Four answers (q1, q3, q6, q7) were already paraphrased differently between the two before this pass and still are. Google expects structured data to match visible text, so align them next time either is edited.
