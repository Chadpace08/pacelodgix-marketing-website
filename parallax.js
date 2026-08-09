/* ════════════════════════════════════════════════════════════════════════
   Pace Lodgix — GSAP enhancement layer

   Loaded AFTER scroll.js. It does two things:

     1. Takes over the three scroll-linked transforms that feel best when they
        are tied directly to the scrollbar with `scrub` — the hero mockup
        un-tilt, the Night Dim crossfade, and the phone screenshot pan — and
        re-drives them through GSAP ScrollTrigger. When it does, it sets
        window.__parallax so scroll.js stands down on exactly those three (see
        the "GSAP handoff" note in scroll.js). Every other effect stays with
        scroll.js in both modes.

     2. Adds new layered-depth motion the base engine never had: parallax on the
        hero's background glow, and a floating 3D tilt on the hero cards that
        follows the pointer.

   THE THREE HARD RULES IT KEEPS (same discipline as scroll.js):
     • Reduced motion wins. If the user asked for less motion, this file returns
       immediately and scroll.js's own reduced-motion path is all that runs.
     • No GSAP, no problem. If the CDN fails, window.gsap is undefined, this
       file returns, the flag is never set, and scroll.js runs every effect the
       old way. The page is never left half-animated.
     • Composited properties only — transform and opacity. Nothing here touches
       layout. ScrollTrigger reads geometry off the main thread and caches it,
       exactly as the hand-written engine did.

   Note on layering: the hero cards and mockup also carry a CSS `bob` animation
   (styles.css) that animates the `translate` property. GSAP writes the separate
   `transform` property, and the two compose in the browser — so the float keeps
   running underneath the parallax and tilt with no conflict.
   ════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !window.gsap || !window.gsap.registerPlugin || !window.ScrollTrigger) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Signal to scroll.js: stand down on the hero-frame tilt, the dim crossfade
  // and the phone pan — GSAP owns them now. Set synchronously, before this
  // file's first ScrollTrigger builds, so scroll.js sees it on frame one.
  window.__parallax = true;

  const $ = (sel) => document.querySelector(sel);

  /* ── 1. Hero mockup un-tilt (owned) ───────────────────────────────────────
     Same pose as the CSS starting state — rotateX 17°, scale 0.94 — flattening
     to 0°/1 as the frame rises into view. `scrub: 0.6` adds a touch of inertia
     so it glides to the scroll position instead of snapping to it, which is the
     whole point of moving it here. transformPerspective matches the stage's
     1800px so the depth reads identically to the old inline transform. */
  const heroFrame = $('#heroFrame');
  if (heroFrame) {
    gsap.set(heroFrame, { transformPerspective: 1800, transformOrigin: '50% 0%' });
    gsap.fromTo(
      heroFrame,
      { rotateX: 17, scale: 0.94 },
      {
        rotateX: 0,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: heroFrame,
          start: 'top bottom',
          end: 'top center',
          scrub: 0.6,
        },
      }
    );
  }

  /* ── 2. Hero background parallax (new) ─────────────────────────────────────
     The blob-glow layer drifts down a little slower than the page scrolls, so
     the field reads as sitting behind the headline rather than on it. Kept
     small (per the parallax playbook, 10–16% keeps foreground and background
     from visibly desyncing) and applied to the layer's container, never to the
     type. The blobs keep their own CSS drift underneath this. */
  const blobs = $('.hero-field .blobs');
  if (blobs) {
    gsap.to(blobs, {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /* ── 3. Night Dim crossfade (owned) ───────────────────────────────────────
     Drives the same --dim-mix custom property scroll.js did (the CSS reads it
     as the dark screenshot's opacity). Animated through a proxy object + a
     scrubbed tween rather than a raw scroll sum, so the blend is tied to the
     scrollbar and eases in and out of the section instead of tracking it 1:1. */
  const dimStage = $('#dimStage');
  if (dimStage) {
    const proxy = { v: 0 };
    gsap.to(proxy, {
      v: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: dimStage,
        start: 'top 68%',
        end: 'bottom 85%',
        scrub: 0.5,
      },
      onUpdate: () => dimStage.style.setProperty('--dim-mix', proxy.v.toFixed(3)),
    });
  }

  /* ── 4. Phone screenshot pan (owned) ──────────────────────────────────────
     The tall dashboard capture scrolls up inside the phone as the section
     passes through the viewport. The travel distance depends on the rendered
     image height, so it is a function value recomputed on every refresh
     (invalidateOnRefresh) — fonts and images can change the layout after first
     paint, and ScrollTrigger refreshes on load and resize. */
  const phoneFront = $('#phoneFront');
  if (phoneFront) {
    const img = phoneFront.querySelector('img');
    const screen = phoneFront.querySelector('.frame-screen');
    if (img && screen) {
      gsap.fromTo(
        img,
        { y: 0 },
        {
          y: () => -Math.max(0, img.offsetHeight - screen.offsetHeight),
          ease: 'none',
          scrollTrigger: {
            trigger: phoneFront,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );
    }
  }

  /* ── 5. Floating 3D hero cards (new) ──────────────────────────────────────
     Desktop, fine-pointer only. On touch there is no pointer to follow and the
     cards are the hero's only readable proof on a phone, so they are left to
     their calm CSS float. Two effects, composed:

       • scroll parallax — each card drifts up at its own rate as the hero
         scrolls away, the nearer (larger) cards faster, which is what sells the
         layered depth.
       • pointer tilt — the trio leans a few degrees toward the cursor on a
         shared perspective, like a small stack of glass panes catching a turn.

     quickTo gives the tilt its own eased interpolator so it lags the cursor
     softly instead of tracking it rigidly. Everything is one rAF-batched
     pointer read; no layout is touched. */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (pointer: fine)', () => {
    const cards = gsap.utils.toArray('.float-card');
    if (!cards.length) return;

    // Depth per card: bigger/nearer travels more on scroll.
    const depth = { 'float-booking': 22, 'float-cal': 16, 'float-stat': 12 };
    cards.forEach((card) => {
      const key = Object.keys(depth).find((k) => card.classList.contains(k));
      gsap.to(card, {
        yPercent: -(depth[key] || 16),
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // Shared-perspective pointer tilt.
    const rotX = cards.map((c) => gsap.quickTo(c, 'rotationX', { duration: 0.7, ease: 'power3' }));
    const rotY = cards.map((c) => gsap.quickTo(c, 'rotationY', { duration: 0.7, ease: 'power3' }));
    gsap.set(cards, { transformPerspective: 800, transformOrigin: 'center' });

    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // -0.5 … 0.5 from viewport centre.
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        cards.forEach((_, i) => {
          rotY[i](nx * 7);
          rotX[i](-ny * 7);
        });
      });
    };
    addEventListener('pointermove', onMove, { passive: true });

    // matchMedia cleanup: drop the listener and level the cards when the query
    // stops matching (e.g. a resize down to tablet).
    return () => {
      removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
      gsap.to(cards, { rotationX: 0, rotationY: 0, duration: 0.3 });
    };
  });

  /* ── 6. "The problem" cards — mobile content reveal (new) ─────────────────
     Mobile only, the exact complement of the hero-card query above (901px is
     the row's 3-up→stack collapse point). On a phone these three cards lose
     their whole hover story — the lift, the icon-tile brighten — so the row
     arrives as flat prose with only the ambient bob. This gives each card a
     staggered entrance as it scrolls up: the icon tile pops in on a back-ease,
     then the heading and copy rise in behind it, so the card assembles itself
     instead of just fading.

     Why the CHILDREN and never the card: the card element already runs the CSS
     `card-bob` float on its `transform`. Animating the card's transform here
     would fight that. The icon/h3/p carry no transform of their own, so the
     timeline owns them cleanly and the bob keeps floating the frame underneath.

     Why gsap.from and no CSS hide-state: the from-values live only while this
     file runs. If the CDN fails or motion is reduced, the block never executes
     and the children stay fully visible — the "no GSAP, no problem" rule. The
     section is below the fold, so the from-state is set long before the row is
     scrolled into view; nothing is painted then hidden. */
  mm.add('(max-width: 900px)', () => {
    const cards = gsap.utils.toArray('.problem .cards > .card');
    if (!cards.length) return;

    const timelines = cards.map((card) => {
      const icon = card.querySelector('.card-icon');
      const heading = card.querySelector('h3');
      const copy = card.querySelector('p');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true, // entrances play once; nothing to recompute on re-entry
        },
      });

      // autoAlpha = opacity + visibility, so the from-state is inert to taps.
      tl.from(icon, {
        autoAlpha: 0, scale: 0.55, rotation: -10, y: 12,
        duration: 0.55, ease: 'back.out(1.7)',
      })
        .from(heading, {
          autoAlpha: 0, y: 16, duration: 0.4, ease: 'power2.out',
        }, '-=0.28')
        .from(copy, {
          autoAlpha: 0, y: 16, duration: 0.45, ease: 'power2.out',
        }, '-=0.30');

      return tl;
    });

    // matchMedia cleanup on a resize up to desktop: kill each timeline's
    // trigger and clear the inline props GSAP wrote, handing the children back
    // to the cascade untouched.
    return () => {
      timelines.forEach((tl) => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      });
      gsap.set('.problem .cards > .card :is(.card-icon, h3, p)', { clearProps: 'all' });
    };
  });

  /* Fonts change metrics after first paint (the display face swaps in), which
     moves every trigger start/end. One refresh once the webfonts are ready
     keeps the scrub positions honest. Guarded — document.fonts is not
     universal. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
