/* ════════════════════════════════════════════════════════════════════════
   Pace Lodgix — marketing scroll engine

   No framework, no build step — the same constraint the app runs under.

   Two rules hold the whole file together:

   1. THE SCROLL HANDLER NEVER READS LAYOUT. Anything that needs geometry
      (getBoundingClientRect, offsetTop, scrollHeight) is measured once into a
      cache and re-measured only on resize. A layout read inside a scroll
      handler forces a synchronous reflow on every frame, and that is exactly
      what makes a "cinematic" page stutter on a mid-range Android — which is
      most of this product's market. (Same discipline as table-scroll.js in
      the app; see CLAUDE.md gotcha 22d.)

   2. THE SCROLL HANDLER ONLY WRITES COMPOSITED PROPERTIES — transform,
      opacity, and custom properties that feed them. Never width, top, margin.

   Entrances (.reveal) are IntersectionObserver, not scroll maths, because the
   browser does that work off the main thread.
   ════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ── 1. Reveal on scroll ──────────────────────────────────────────────
     Unobserve after firing: these are one-shot entrances, and leaving 100+
     elements observed for the life of the page is pure overhead. */
  const revealables = document.querySelectorAll('.reveal');

  if (reduced) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    );
    revealables.forEach((el) => revealObserver.observe(el));
  }

  /* ── 2. Animated counters ─────────────────────────────────────────────
     Fires once, when the counter first enters view. easeOutExpo so the number
     lands rather than crawls. */
  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const DURATION = 1800;
    const start = performance.now();

    function frame(now) {
      const t = clamp((now - start) / DURATION, 0, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const value = target * eased;

      el.textContent =
        prefix +
        value.toLocaleString('en-PH', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix;

      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll('[data-count]');
  if (reduced) {
    // Skip the animation but still show the real figure.
    counters.forEach((el) => {
      const d = parseInt(el.dataset.decimals || '0', 10);
      el.textContent =
        (el.dataset.prefix || '') +
        parseFloat(el.dataset.count).toLocaleString('en-PH', {
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        }) +
        (el.dataset.suffix || '');
    });
  } else if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ── 3. Sticky showcase — which step is active ────────────────────────
     Also an observer, not scroll maths. The step whose middle is nearest the
     viewport centre wins; its screenshot cross-fades in. */
  const steps = document.querySelectorAll('.step');
  const shots = document.querySelectorAll('#scrollyScreen img');

  if (steps.length && shots.length) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const step = entry.target;
          const name = step.dataset.shot;

          steps.forEach((s) => s.classList.toggle('is-active', s === step));
          shots.forEach((img) =>
            img.classList.toggle('is-active', img.dataset.shot === name)
          );
        }
      },
      // A band across the middle of the viewport: a step is "active" only
      // while it is crossing the centre line.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    steps.forEach((s) => stepObserver.observe(s));
  }

  /* ── 4. Automation flow — light the chain as it's read ────────────────── */
  const flow = document.getElementById('flow');
  const flowNodes = document.querySelectorAll('.flow-node');

  if (flowNodes.length && !reduced) {
    const flowObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('is-lit');
        }
      },
      { rootMargin: '0px 0px -25% 0px', threshold: 0.4 }
    );
    flowNodes.forEach((n) => flowObserver.observe(n));
  }

  /* ── 5. Scroll-linked effects ─────────────────────────────────────────
     Everything below is driven from ONE rAF-coalesced scroll listener, off a
     geometry cache. Adding a second listener, or a rect read in here, is what
     would cost the frame budget. */

  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const heroFrame = document.getElementById('heroFrame');
  const dimStage = document.getElementById('dimStage');
  const scrollyScreen = document.getElementById('scrollyScreen');
  const phoneFront = document.getElementById('phoneFront');
  const rail = document.querySelector('.scrolly-steps');

  // ── Geometry cache. Written on load + resize, read on scroll. ──
  const geo = {};

  function measure() {
    geo.docScrollable = document.documentElement.scrollHeight - innerHeight;
    geo.vh = innerHeight;

    if (heroFrame) {
      const r = heroFrame.getBoundingClientRect();
      geo.heroFrameTop = r.top + scrollY;
    }

    if (dimStage) {
      const r = dimStage.getBoundingClientRect();
      geo.dimTop = r.top + scrollY;
      geo.dimH = r.height;
    }

    if (phoneFront) {
      const r = phoneFront.getBoundingClientRect();
      geo.phoneTop = r.top + scrollY;
      geo.phoneH = r.height;
      // How far the tall screenshot can travel inside the phone's viewport.
      const img = phoneFront.querySelector('img');
      const screen = phoneFront.querySelector('.frame-screen');
      geo.phoneTravel = img && screen
        ? Math.max(0, img.offsetHeight - screen.offsetHeight)
        : 0;
    }
  }

  /* The tall screenshots inside the showcase frame are far taller than the
     16:10 window they sit in. Rather than crop them, pan each one as its step
     is read — so the whole page is visible over the life of the section. */
  function panShots() {
    if (!scrollyScreen) return;
    const screen = scrollyScreen;
    const screenH = screen.offsetHeight;

    shots.forEach((img) => {
      const travel = Math.max(0, img.offsetHeight - screenH);
      img.dataset.travel = String(travel);
    });
  }

  function onScroll() {
    const y = scrollY;

    // Nav: solid once we're off the hero photo.
    if (nav) nav.classList.toggle('is-stuck', y > 40);

    // Progress bar.
    if (progress && geo.docScrollable > 0) {
      const p = clamp(y / geo.docScrollable, 0, 1);
      progress.style.setProperty('--p', (p * 100).toFixed(2) + '%');
    }

    // The showcase progress rail. Sits ABOVE the reduced-motion return with
    // the top progress bar, not below it with the parallax: it reports how far
    // through the tour you are, and a rail stuck permanently at zero reads as
    // broken rather than as calm.
    if (rail) {
      const r = rail.getBoundingClientRect();
      const t = clamp((geo.vh * 0.5 - r.top) / r.height, 0, 1);
      rail.style.setProperty('--rail-fill', t.toFixed(3));
    }

    if (reduced) return;

    /* The hero photo parallax lived here. The hero is a CSS gradient field now
       (.hero-field) — translating a vertical gradient produces no visible
       movement, so there is nothing left to parallax and the geo.heroH
       measurement went with it. The blobs carry the hero's motion in CSS. */

    /* ── GSAP handoff ──────────────────────────────────────────────────────
       parallax.js (loaded after this file) sets window.__parallax when GSAP is
       present and motion is allowed, and re-implements the three transforms
       below on ScrollTrigger `scrub` for a smoother, scrollbar-tied feel. When
       it does, this file stands down on exactly those three so the two engines
       never write the same property in the same frame. Everything else here —
       the progress bar, the showcase pan, the flow spine, every observer — is
       still owned by this file in both modes. If GSAP fails to load, the flag
       is never set and the original code below runs unchanged. */
    const gsapOwns = window.__parallax === true;

    // Hero mockup: un-tilts and scales up to flat as it rises into view.
    if (heroFrame && !gsapOwns) {
      const start = geo.heroFrameTop - geo.vh;
      const t = clamp((y - start) / (geo.vh * 0.85), 0, 1);
      const rot = 17 * (1 - t);
      const scale = 0.94 + 0.06 * t;
      heroFrame.style.transform =
        `perspective(1800px) rotateX(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    }

    // Night Dim crossfade: 0 → 1 across the middle of the section.
    if (dimStage && !gsapOwns) {
      const start = geo.dimTop - geo.vh * 0.85;
      const span = geo.dimH + geo.vh * 0.4;
      const t = clamp((y - start) / span, 0, 1);
      // Hold light at the top, dark at the bottom, and do the blend in the
      // middle 60% — a straight linear ramp makes the switch feel accidental.
      const mix = clamp((t - 0.2) / 0.6, 0, 1);
      dimStage.style.setProperty('--dim-mix', mix.toFixed(3));
    }

    // The tall phone screenshot scrolls inside the phone.
    if (phoneFront && geo.phoneTravel > 0 && !gsapOwns) {
      const start = geo.phoneTop - geo.vh;
      const t = clamp((y - start) / (geo.vh + geo.phoneH), 0, 1);
      const img = phoneFront.querySelector('img');
      if (img) img.style.transform = `translate3d(0, ${(-geo.phoneTravel * t).toFixed(1)}px, 0)`;
    }

    // The active showcase screenshot pans as its step is read.
    if (scrollyScreen) {
      const active = scrollyScreen.querySelector('img.is-active');
      if (active) {
        const step = document.querySelector(`.step[data-shot="${active.dataset.shot}"]`);
        const travel = parseFloat(active.dataset.travel || '0');
        if (step && travel > 0) {
          // Cheap, allowed: this rect is on an element already being composited
          // and we need its live position relative to the viewport. It is one
          // read per frame, not one per element.
          const r = step.getBoundingClientRect();
          const t = clamp((geo.vh * 0.5 - r.top) / r.height, 0, 1);
          active.style.transform = `translate3d(0, ${(-travel * t).toFixed(1)}px, 0)`;
        }
      }
    }

    // The automation spine draws itself as the section is read.
    if (flow) {
      const r = flow.getBoundingClientRect();
      const t = clamp((geo.vh * 0.75 - r.top) / r.height, 0, 1);
      flow.style.setProperty('--flow-fill', t.toFixed(3));
    }
  }

  // rAF-coalesce: many scroll events, at most one paint per frame.
  let ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  }

  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', () => {
    measure();
    panShots();
    requestTick();
  });

  // Images decide the geometry, so re-measure once they've landed.
  addEventListener('load', () => {
    measure();
    panShots();
    requestTick();
  });

  measure();
  panShots();
  requestTick();

  /* ── 6. Video lightbox ────────────────────────────────────────────────
     The clips are 1.7–6.8MB. None of them is in the DOM until it's asked for —
     the grid shows poster images only, and the <video> src is set on click. */
  const lightbox = document.getElementById('lightbox');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src) {
    lightboxVideo.src = src;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxVideo.play().catch(() => { /* autoplay blocked — controls are there */ });
  }

  function closeLightbox() {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();          // drop the buffer
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.video-play').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Serve the lighter phone-captured clip on narrow screens when one exists;
      // fall back to the full desktop recording otherwise. Chosen per click, so
      // rotating the device between clicks always picks the right one.
      const onPhone = matchMedia('(max-width: 720px)').matches;
      const src = (onPhone && btn.dataset.srcMobile) || btn.dataset.src;
      openLightbox(src);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ── 7. FAQ — one open at a time ──────────────────────────────────────── */
  const faqs = document.querySelectorAll('.faq details');
  faqs.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      faqs.forEach((other) => {
        if (other !== d) other.open = false;
      });
    });
  });

  /* ── 8. Hero video — play only while it is actually on screen ──────────
     The markup carries preload="none" and no autoplay attribute, so by
     default the browser fetches nothing and paints the poster. Playback is
     opt-in here for three reasons:

       • prefers-reduced-motion gets the poster and never the loop. An
         autoplay attribute cannot be conditional; this can.
       • The ~1.1MB clip stays off the critical path — it is requested only
         once the frame enters the viewport, so it never competes with the
         hero photo or the fonts for the first paint.
       • Pausing once it scrolls away stops a decorative loop from burning
         battery through the whole page. Mid-range Android is the market.

     play() rejects when a browser refuses autoplay even muted; that is a
     non-event — the poster is already the right fallback, so swallow it. */
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo && !reduced) {
    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) heroVideo.play().catch(() => {});
          else heroVideo.pause();
        });
      },
      { threshold: 0.15 },
    ).observe(heroVideo);
  }
})();
