/* ════════════════════════════════════════════════════════════════════════
   Pace Lodgix — mobile nav menu

   Its own file, not part of scroll.js, because all three pages need it and
   only index.html needs the scroll engine. privacy.html and terms.html have
   the same bar with the same five destinations; loading the parallax /
   scrolly / lightbox machinery on a static legal document just to open a
   menu would be a poor trade.

   The panel is a DISCLOSURE, not a modal: focus stays on the button when it
   opens, the panel is next in DOM order so Tab walks straight into it, and
   the page behind is not locked. Five links do not warrant a focus trap.

   `inert` is the closed state, not `hidden` — hidden kills the transition,
   and display:none would too. inert takes the panel out of the tab order and
   the accessibility tree while CSS keeps it visually gone (visibility:
   hidden, which is also what stops it being read by AT if inert is ever
   unsupported).
   ════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('navPanel');

  if (!nav || !toggle || !panel) return;

  // Must match the breakpoint where .nav-toggle appears in styles.css. Above
  // it the panel does not exist as far as the user is concerned, so an open
  // menu has to be torn down on rotate/resize rather than left hanging.
  const desktop = matchMedia('(min-width: 901px)');

  let open = false;

  function setOpen(next) {
    if (next === open) return;
    open = next;

    nav.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) panel.removeAttribute('inert');
    else panel.setAttribute('inert', '');
  }

  toggle.addEventListener('click', () => setOpen(!open));

  /* Any link in the panel is a destination — close behind it. On index.html
     that hands the jump straight to the browser's smooth scroll (the panel is
     gone before the scroll starts, so it never scrolls with the page under
     it); on the legal pages the link is a real navigation and the close is
     moot, but harmless. */
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Escape closes and hands focus back — the panel is a disclosure the button
  // owns, so the button is where focus belongs when it goes away.
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !open) return;
    setOpen(false);
    toggle.focus();
  });

  // Tapping the page outside the bar closes it. `pointerdown` rather than
  // `click` so the menu is already gone by the time a tap on a link or a
  // video poster underneath resolves.
  addEventListener('pointerdown', (e) => {
    if (!open) return;
    if (!nav.contains(e.target)) setOpen(false);
  });

  // Rotating a phone to landscape can cross 900px with the menu open, which
  // would leave an orphaned panel under a bar that has its links back.
  const onBreakpoint = (e) => { if (e.matches) setOpen(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else desktop.addListener(onBreakpoint);          // Safari < 14

  // The markup ships with inert already set, so the closed state is correct
  // before this file runs and there is nothing to initialise here.
})();
