# Photo credits — `assets/features/` *(removed — historical record)*

> **THESE TWELVE PHOTOS ARE NO LONGER IN THE REPO.** The 2026 redesign replaced
> the photographic feature grid with drawn icons (see Round 6 in
> `redesign.css` for why), so the images were deleted rather than left to ship
> unused. They were never committed, so this table is the **only** way to get
> them back — every Pexels ID below still resolves. Keep this file.

The twelve photographs in the old "Sixteen jobs" card grid came from **Pexels**.

**Licence:** the Pexels Licence. Free to use, including commercially, and no
attribution is required. What it does **not** allow: reselling the photos
unaltered, or using identifiable people or property in a way that suggests
they endorse PaceLodgix. Our use — background imagery on a feature grid —
sits well inside that. Full terms: https://www.pexels.com/license/

This file exists so the sources are recoverable later. It is **not** a legal
requirement. `.assetsignore` excludes `*.md`, so it is never served publicly.

| File | Pexels photo ID | Source page |
|---|---|---|
| `properties.webp` | 27429700 | https://www.pexels.com/photo/27429700/ |
| `reservations.webp` | 5371683 | https://www.pexels.com/photo/5371683/ |
| `guests.webp` | 34607320 | https://www.pexels.com/photo/34607320/ |
| `channels.webp` | 8250965 | https://www.pexels.com/photo/8250965/ |
| `direct-booking.webp` | 2476632 | https://www.pexels.com/photo/2476632/ |
| `messaging.webp` | 3769980 | https://www.pexels.com/photo/3769980/ |
| `payments.webp` | 38850274 | https://www.pexels.com/photo/38850274/ |
| `expenses.webp` | 32041165 | https://www.pexels.com/photo/32041165/ |
| `reports.webp` | 12663151 | https://www.pexels.com/photo/12663151/ |
| `team.webp` | 3770291 | https://www.pexels.com/photo/3770291/ |
| `mobile.webp` | 28243791 | https://www.pexels.com/photo/28243791/ |
| `marketing.webp` | 22041232 | https://www.pexels.com/photo/22041232/ |

The other four cards (Booking Calendar, Invoicing, Income Dashboard,
Occupancy Analytics) use our own product screenshots from `assets/shots/`.

## If you replace one

Keep the recipe, or the grid stops looking like one set:

1. **760 × 570**, cropped to that ratio — not scaled to fit.
2. Exported to WebP at quality ~70. Command used:
   `ffmpeg -i in.jpg -vf "scale=760:570" -c:v libwebp -quality 70 out.webp`
3. Warm, natural light. No cold blue-white office photography, no visible
   foreign currency, no obvious stock-photo posing.
4. Add the new ID to the table above.

The warm wash that binds the twelve together is CSS, not baked into the
files — see `--jc-wash` notes in `preview.css`.
