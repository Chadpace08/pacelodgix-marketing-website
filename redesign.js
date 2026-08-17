/* ════════════════════════════════════════════════════════════════════════
   PACE LODGIX — REDESIGN LAYER, MOTION
   LIVE. Loaded last by index.html, after nav.js, scroll.js, GSAP and
   parallax.js — it needs ScrollTrigger already parsed and registered.

   WAS "preview.js", promoted alongside redesign.css. Renamed so nothing on
   the live site is called "preview".

   IT DRIVES EXACTLY TWO THINGS, both in #features:

     1. Column drift. One scrubbed tween writes a single number — --shift, in
        pixels — onto the grid. Every card inherits it and multiplies it by its
        own --drift (set per column in redesign.css), so sixteen cards move at
        four different rates off ONE animated property. Animating sixteen
        separate tweens would have been the obvious way and the wrong one:
        sixteen ScrollTriggers all reading the same scroll position is sixteen
        times the bookkeeping for the same picture.

     2. The light behind the grid. A warm pool that follows the pointer,
        written as --mx/--my onto .jobs-light. It is the field's response, not
        any card's — the cards are not links and must not react (see the
        no-hover note in redesign.css).

   THE SAME THREE RULES THE REST OF THE SITE KEEPS:
     • Reduced motion wins. This file returns immediately, and the CSS
       defaults (--shift: 0px, --mx/--my at the centre) are a complete,
       correct, still layout.
     • No GSAP, no problem. If the CDN failed, window.gsap is undefined and the
       drift never runs. The pointer light does not need GSAP, so it is written
       in plain rAF and still works.
     • Composited properties only. `translate` and a background position.
       Nothing here reads or writes layout.

   STILL SEPARATE FROM parallax.js on purpose. Folding section 1 in next to
   the hero-card parallax and section 2 beside it is the tidy end state, but
   while the redesign is new the whole thing being one <script> tag and one
   <link> tag is worth more — it is reversible in two deletions.
   ════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const grid = document.getElementById('jobsGrid');
  if (!grid) return;

  /* ── 1. Column drift ──────────────────────────────────────────────────────
     --shift runs from +TRAVEL to -TRAVEL as the section crosses the viewport,
     so the columns are furthest apart at the two ends and closest at the
     middle — the grid opens as it arrives and closes as it leaves, instead of
     drifting one way and staying there.

     Zero is deliberately at the MIDDLE of the travel, not at the start: that
     is the moment the reader is actually looking at the section, and it is the
     one moment the diagonal is exactly as redesign.css drew it.

     RAISED FROM 44 TO 58. At 44 the effect was real and measurable and almost
     nobody could see it, which makes it decoration that costs something and
     returns nothing. What matters is not this number on its own but the
     RELATIVE shear between neighbouring columns: they carry opposite signs, so
     a column at +1 and its neighbour at -1 are 2 × 2 × 58 = 232px apart at the
     two ends of the scroll and exactly level in the middle. That is the number
     the eye reads, and it is now unmistakable.

     Still inside the parallax playbook's 10-16%: 116px of travel per column
     against a section around 900px tall. Past this the cards stop reading as
     layers at different depths and start reading as a page that is broken.
     The CSS pays for it in headroom — see the grid's margin-top and
     padding-bottom, both of which are sized off this value.

     scrub: 0.7 rather than true, so the columns glide to the scroll position
     with a little inertia. That lag is most of what makes the four columns
     read as four separate weights rather than one rig. */
  const TRAVEL = 58;

  if (window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const proxy = { v: TRAVEL };
    gsap.to(proxy, {
      v: -TRAVEL,
      ease: 'none',
      scrollTrigger: {
        trigger: grid,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.7,
      },
      onUpdate: () => grid.style.setProperty('--shift', proxy.v.toFixed(1) + 'px'),
    });
  }

  /* ── 2. The pointer light ─────────────────────────────────────────────────
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
