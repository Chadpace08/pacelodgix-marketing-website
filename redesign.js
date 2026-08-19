/* ════════════════════════════════════════════════════════════════════════
   PACE LODGIX — REDESIGN LAYER, MOTION
   LIVE. Loaded last by index.html, after nav.js, scroll.js, GSAP and
   parallax.js.

   WAS "preview.js", promoted alongside redesign.css. Renamed so nothing on
   the live site is called "preview".

   IT NOW DRIVES EXACTLY ONE THING in #features: the light behind the bento.
   A warm pool follows the pointer, written as --mx/--my onto .jobs-light. It
   is the field's response, not any pane's — the panes are not links and the
   only per-card response is the CSS hover in redesign.css.

   WHAT WAS REMOVED IN ROUND 15 — the scrubbed column-drift tween. It wrote
   --shift onto the sixteen-card diagonal every scroll frame; the diagonal is
   gone (the cards are now four grouped panes), and a scroll-scrubbed tween is
   the one kind of motion that can actually cost a frame while scrolling. The
   entrance is now handled entirely by the .reveal IntersectionObserver in
   scroll.js, which fires once and unhooks. So this file no longer needs GSAP
   at all — the pointer light is plain requestAnimationFrame.

   THE SAME RULES THE REST OF THE SITE KEEPS:
     • Reduced motion wins. This file returns immediately, and the CSS default
       (--mx/--my at the centre) is a complete, correct, still layout.
     • Composited properties only. A background position. Nothing here writes
       layout; the one layout READ (getBoundingClientRect) is on a pointer
       event, never inside the rAF loop.

   STILL SEPARATE FROM parallax.js on purpose: the whole redesign stays
   reversible by deleting one <script> tag and one <link> tag.
   ════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const grid = document.getElementById('jobsGrid');
  if (!grid) return;

  /* ── The pointer light ────────────────────────────────────────────────────
     Fine pointers only. On touch there is nothing to follow, and the CSS
     default already puts the pool at 50% 30%, which is where the section's own
     light source sits — so a phone gets a deliberate static bloom rather than
     a missing effect.

     Two things keep this cheap. The listener is on the GRID, not the window,
     so it is silent for the rest of the page. And the pointer position is
     eased toward rather than tracked exactly (LERP below), which both smooths
     a jumpy trackpad and means the rAF loop only runs while the light is still
     catching up — it stops itself when it arrives. */
  const light = grid.querySelector('.jobs-light');
  if (!light || !matchMedia('(pointer: fine)').matches) return;

  const LERP = 0.12;          // how fast the pool catches the cursor
  const SETTLE = 0.15;        // px, under which it is close enough to stop

  let targetX = 0, targetY = 0;   // pointer, in px relative to .jobs-light
  let x = 0, y = 0;               // where the pool actually is
  let raf = 0;
  let seeded = false;

  function step() {
    x += (targetX - x) * LERP;
    y += (targetY - y) * LERP;

    light.style.setProperty('--mx', x.toFixed(1) + 'px');
    light.style.setProperty('--my', y.toFixed(1) + 'px');

    if (Math.abs(targetX - x) > SETTLE || Math.abs(targetY - y) > SETTLE) {
      raf = requestAnimationFrame(step);
    } else {
      raf = 0;
    }
  }

  grid.addEventListener('pointermove', (e) => {
    // getBoundingClientRect is a layout read, but it happens on a pointer
    // event and never inside the rAF loop, so it cannot cause a per-frame
    // reflow. The rect is re-read each move rather than cached because the
    // grid's own drift changes nothing about it but a resize or a lazy image
    // above it would, and a stale rect puts the light in the wrong place.
    const r = light.getBoundingClientRect();
    targetX = e.clientX - r.left;
    targetY = e.clientY - r.top;

    // First move: land the pool on the cursor instead of sliding it in from
    // the 0,0 corner, which reads as a bug rather than as an entrance.
    if (!seeded) { x = targetX; y = targetY; seeded = true; }

    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });

  // Leaving the grid returns the pool to the section's own light source rather
  // than freezing it wherever the cursor happened to exit.
  grid.addEventListener('pointerleave', () => {
    const r = light.getBoundingClientRect();
    targetX = r.width * 0.5;
    targetY = r.height * 0.3;
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });
})();
