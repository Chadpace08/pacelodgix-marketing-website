# Brand update — handover for the app (app.pacelodgix.com)

Written 2026-07-23. The marketing site is **done**; this note covers the app,
whose codebase is not in this workspace.

## What the new identity is

The old green/gold hexagon "P" emblem is retired. The new identity is two
pieces, both supplied as white artwork on transparency:

| Piece | Master file (kept in this folder, not deployed) | Aspect |
|---|---|---|
| Mark | `Pace Lodgix Logo White.png` (1536×1024) | 1.46 : 1 |
| Wordmark | `Pace Lodgix Wordmark v2.png` (1536×1024) | 5.09 : 1 |

**Neither master is square.** The old app icon was, so anything that sets an
equal width and height will squash these. Size by *height*, `width: auto`.

## Ready-to-use exports

These are already generated in `assets/` and can be copied straight into the
app. All are derived from the masters with the outer glow removed and trimmed
to the artwork.

| File | Size | Use |
|---|---|---|
| `logo-mark-white.png` | 187×128 | mark on dark surfaces |
| `logo-mark-forest.png` | 187×128 | mark on light surfaces (`#1F3A2A`) |
| `wordmark-white.png` | 489×96 | wordmark on dark surfaces |
| `wordmark-forest.png` | 489×96 | wordmark on light surfaces |
| `favicon-32.png` | 32×32 | browser tab |
| `logo-256.png` | 256×256 | 256px icon + schema.org Organization logo |
| `apple-touch-icon.png` | 180×180 | iOS home screen (opaque, white on `#0D1F16`) |

## The one thing that will bite you

**The supplied artwork is white only, and white is invisible on every light
surface.** This is not a nitpick — it is why there are two colour variants of
each asset. Before dropping the white mark anywhere in the app, check what is
behind it:

- **Dark surface** (the app's forest sidebar, any dark header) → white files.
- **Light surface** (light-theme content area, white cards, modals, the login
  screen, browser tabs, printed/PDF invoices) → forest files.

The forest variant is the silhouette of the mark filled flat with `#1F3A2A`
(`--primary`). It was approved for exactly this purpose.

If the app has a light/dim theme toggle, the lockup has to switch with it.
On the marketing site this is done by shipping both images stacked in one grid
cell and cross-fading opacity — see the "Brand lockup" comment block in
`styles.css`. Copy that pattern rather than a CSS `filter`, which cannot turn
the bevelled white render into a clean flat forest fill.

## App checklist

1. **Sidebar lockup.** Currently the old hexagon + "Pace Lodgix" text. Replace
   with `logo-mark-white.png` + `wordmark-white.png` (the sidebar is dark).
   Size by height; do not reuse the old square dimensions.
2. **Favicon / PWA icons / manifest.** Swap in `favicon-32.png`,
   `logo-256.png`, `apple-touch-icon.png`. Check `manifest.json` icon entries
   if the app has one.
3. **Login / signup screen.** Check the background before choosing a variant.
4. **Transactional email templates and PDF invoices.** These almost always
   render on white — use the **forest** files. Email clients need absolute
   URLs, so host them rather than inlining relative paths.
5. **Any hard-coded `logo-256.png` reference** that expected the old hexagon.
6. **Tenant-facing booking pages**, which may use their own background colour.
7. **Accessibility.** On the marketing site the images are `alt=""` and the
   link carries `aria-label="Pace Lodgix — home"`, so the name is announced
   once. Mirror that; don't give both images the same alt text.
8. **Narrow widths.** At ≤380px the marketing nav hides the wordmark and keeps
   the mark alone — measured, because bar + "Sign in" + CTA needed ~332px and
   a 320px phone was ~12px short. If the app has a comparable top bar, expect
   the same squeeze.

## Also outstanding — marketing site screenshots

`assets/shots/*.webp` and `assets/video/*.mp4` are captures of the **app UI**,
and every one of them still shows the old hexagon logo in the sidebar. They
are raster images, so they cannot be corrected here — they need re-capturing
once the app itself is updated. This is currently the only place the retired
logo is still visible on pacelodgix.com, including the hero dashboard shot.
