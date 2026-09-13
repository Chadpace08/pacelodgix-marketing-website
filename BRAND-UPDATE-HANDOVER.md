# Brand update — mark + wordmark swap, September 2026

Written 2026-09-13, updated same day once the wordmark changed too. Supersedes
the July 2026 rebrand below for **both** the mark and the wordmark.

## What changed — the mark

Chad supplied a new master mark: `Pace Lodgix Mark 2026.png` (kept in this
folder and in `pms-app/`, not deployed — 1254×1254, square, full colour,
transparent background). It replaces the July 2026 "P/2" white-only mark.
Unlike the July master, this one is **already in brand colours** (deep forest
`#1F3A2A` fading to gold `#D9B25F`, with a cream `#FDFAF0` facet), so most
placements now use the colour art directly instead of a flat single-tone fill.

| File | Size | Content | Use |
|---|---|---|---|
| `logo-mark-forest.png` | 187×128 | full-colour mark, centered | light surfaces (cards, login on the light theme, nav/footer on white) |
| `logo-mark-white.png` | 187×128 | flat white silhouette | dark surfaces (sidebar, dim theme, any dark header) — the colour art's green would vanish against a dark green background, so this stays a flat cutout like before |
| `logo-256.png` | 256×256 | full-colour mark | schema.org Organization logo, large favicon |
| `favicon-32.png` | 32×32 | full-colour mark | browser tab |
| `apple-touch-icon.png` | 180×180 | opaque, white silhouette on `#0D1F16` | iOS home screen |

## What changed — the wordmark

Chad also replaced the wordmark's typeface and colour treatment, to match the
type style of the **Pace Digital Works** parent-brand wordmark (letterforms
only — the words themselves are still "Pace Lodgix"). New rule, applies to
every wordmark across Chad's brands: **the first word is upright, the second
word is always italic**, in a different colour from the first.

Font: **Playfair Display**, Black weight (900), Google Font, free. The italic
cut is the same family's italic variable font. This is Claude's best visual
match to the reference image — not a confirmed exact font name, since there
is no font metadata inside a picture. If a closer match ever turns up, swap
the font file and re-render; the render script is described below.

| File | Size | Colours |
|---|---|---|
| `wordmark-white.png` | 489×96 | "Pace" white (upright), "Lodgix" light green `#7AB880` (italic) — for dark surfaces |
| `wordmark-forest.png` | 489×96 | "Pace" forest `#1F3A2A` (upright), "Lodgix" mid green `#3A804F` (italic) — for light surfaces |

The old master `Pace Lodgix Wordmark v2.png` (plain sans-serif text, single
colour) is **removed** — retired by this change, not a filename Chad still
uses anywhere.

**Why two different greens for "Lodgix" depending on background:** the exact
brand forest `#1F3A2A` disappears against the dark sidebar, and a very light
green fails on the cream card. Same problem as the mark, same fix — hold the
hue family, adjust lightness per surface.

## Rule going forward

- **Light background → `logo-mark-forest.png` + `wordmark-forest.png`.**
- **Dark background → `logo-mark-white.png` + `wordmark-white.png`.**
- Every file keeps its **old filename and old pixel dimensions**, so no HTML,
  CSS, or `width`/`height` attribute needed to change anywhere in `pms-app` or
  this site. It was a drop-in swap.

## Still outstanding — marketing site screenshots

`assets/shots/*.webp` and `assets/video/*.mp4` are captures of the app UI and
still show whatever mark was live when each was recorded. They are raster
images and cannot be corrected by swapping the PNG — they need re-capturing
once the app's rendered UI reflects this mark.

---

<details>
<summary>Original July 2026 handover (for the wordmark and the sizing rationale — still accurate)</summary>

# Brand update — handover for the app (app.pacelodgix.com)

Written 2026-07-23. The marketing site is **done**; this note covers the app,
whose codebase is not in this workspace.

## What the new identity is

The old green/gold hexagon "P" emblem is retired. The new identity is two
pieces, both supplied as white artwork on transparency:

| Piece | Master file (kept in this folder, not deployed) | Aspect |
|---|---|---|
| Mark | `Pace Lodgix Logo White.png` — **removed 2026-09-13**, retired by the mark swap above | 1.46 : 1 |
| Wordmark | `Pace Lodgix Wordmark v2.png` (1536×1024) — still current, still in this folder | 5.09 : 1 |

**Neither master is square.** The old app icon was, so anything that sets an
equal width and height will squash these. Size by *height*, `width: auto`.

## The one thing that will bite you

**The supplied artwork is white only, and white is invisible on every light
surface.** This is not a nitpick — it is why there are two colour variants of
each asset. Before dropping the white mark anywhere in the app, check what is
behind it:

- **Dark surface** (the app's forest sidebar, any dark header) → white files.
- **Light surface** (light-theme content area, white cards, modals, the login
  screen, browser tabs, printed/PDF invoices) → forest files.

If the app has a light/dim theme toggle, the lockup has to switch with it.
On the marketing site this is done by shipping both images stacked in one grid
cell and cross-fading opacity — see the "Brand lockup" comment block in
`styles.css`. Copy that pattern rather than a CSS `filter`.

## Notes still relevant

1. **Accessibility.** On the marketing site the images are `alt=""` and the
   link carries `aria-label="Pace Lodgix — home"`, so the name is announced
   once. Mirror that; don't give both images the same alt text.
2. **Narrow widths.** At ≤380px the marketing nav hides the wordmark and keeps
   the mark alone — measured, because bar + "Sign in" + CTA needed ~332px and
   a 320px phone was ~12px short.
3. **Transactional email templates and PDF invoices** render on white — use
   the **forest** files. Email clients need absolute URLs, so host them
   rather than inlining relative paths.

</details>
