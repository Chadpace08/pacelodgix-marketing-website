(function () {
  function $(id) { return document.getElementById(id); }

  /* Mobile menu */
  var burger = $('burger'), mnav = $('mnav');
  burger.addEventListener('click', function () { var o = mnav.hidden; mnav.hidden = !o; burger.setAttribute('aria-expanded', String(o)); });

  /* Features mega menu */
  var mb = $('megaBtn'), mega = $('mega'), wrap = mb.parentNode;
  function setMega(o) { mega.hidden = !o; mb.setAttribute('aria-expanded', String(o)); }
  mb.addEventListener('click', function () { setMega(mega.hidden); });
  wrap.addEventListener('mouseenter', function () { setMega(true); });
  wrap.addEventListener('mouseleave', function () { setMega(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMega(false); });

  /* Hero picture: the phone drifts a little as the page scrolls and, with a
     mouse, as the pointer moves, and the browser frame tilts slightly. This
     only writes three numbers onto .hv (--mx, --my, --sy); site.css turns them
     into movement. The scrolling phone screen and the gentle floating are
     plain CSS and need none of this. */
  var hv = $('heroVisual');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hv && !still) {
    var tx = 0, ty = 0, mx = 0, my = 0, hvRaf = 0;
    var drift = function () {
      hvRaf = 0;
      var r = hv.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < -80) return;
      mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
      var p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / vh));
      hv.style.setProperty('--mx', mx.toFixed(3));
      hv.style.setProperty('--my', my.toFixed(3));
      hv.style.setProperty('--sy', p.toFixed(3));
      if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) hvRaf = requestAnimationFrame(drift);
    };
    var queueDrift = function () { if (!hvRaf) hvRaf = requestAnimationFrame(drift); };
    window.addEventListener('scroll', queueDrift, { passive: true });
    window.addEventListener('resize', queueDrift);
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var heroBox = hv.closest('.hero');
      heroBox.addEventListener('mousemove', function (e) {
        var r = hv.getBoundingClientRect();
        tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
        ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
        queueDrift();
      });
      heroBox.addEventListener('mouseleave', function () { tx = 0; ty = 0; queueDrift(); });
    }
    drift();
  }

  /* On the go: the tall dashboard scrolls inside the front phone as the page
     scrolls, the same effect as the live site, without GSAP. It runs from the
     moment the phone enters the bottom of the screen until it leaves the top. */
  var pf = $('phoneFront');
  if (pf) {
    var pimg = pf.querySelector('img'), pscr = pf.querySelector('.pscreen'), ticking = false;
    function panPhone() {
      ticking = false;
      var r = pf.getBoundingClientRect(), vh = window.innerHeight;
      var t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      var travel = Math.max(0, pimg.offsetHeight - pscr.offsetHeight);
      pimg.style.transform = 'translate3d(0,' + (-travel * t).toFixed(1) + 'px,0)';
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(panPhone); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (pimg.complete) panPhone(); else pimg.addEventListener('load', panPhone);
  }

  /* Features: full-width pages that stack as you scroll.
     --stick: where each page pins. Normally just under the header; a page
     taller than the screen pins higher, so it scrolls fully into view first.
     --cover: 0 to 1, how far the next page has slid over this one. */
  var groups = document.querySelectorAll('.fgroup');
  if (groups.length) {
    var hdr = document.querySelector('.hdr'), bar = document.querySelector('.sticky');
    var gTick = false;
    var pinTops = [];
    var measure = function () {
      var vh = window.innerHeight, h = hdr.offsetHeight;
      var b = bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0;
      groups.forEach(function (g, i) {
        var top = Math.min(h, vh - b - g.offsetHeight);
        pinTops[i] = top;
        g.style.setProperty('--stick', top + 'px');
      });
    };
    var cover = function () {
      gTick = false;
      var vh = window.innerHeight;
      for (var i = 0; i < groups.length - 1; i++) {
        var nextTop = groups[i + 1].getBoundingClientRect().top;
        var c = Math.min(1, Math.max(0, (vh - nextTop) / (vh - pinTops[i + 1])));
        groups[i].style.setProperty('--cover', c.toFixed(3));
      }
    };
    var onG = function () { if (!gTick) { gTick = true; requestAnimationFrame(cover); } };
    window.addEventListener('scroll', onG, { passive: true });
    window.addEventListener('resize', function () { measure(); onG(); });
    window.addEventListener('load', function () { measure(); onG(); });
    measure(); cover();
  }

  /* Automation: the live site's timeline. Each step lights up as it comes into
     view, and the gold spine draws itself as the section is read. */
  var flow = $('flow');
  if (flow) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nodes = flow.querySelectorAll('.flow-node');
    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-lit'); });
    } else {
      var fo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-lit'); fo.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -25% 0px', threshold: 0.4 });
      nodes.forEach(function (n) { fo.observe(n); });
      var fTick = false;
      var drawSpine = function () {
        fTick = false;
        var r = flow.getBoundingClientRect();
        var t = Math.min(1, Math.max(0, (window.innerHeight * 0.75 - r.top) / r.height));
        flow.style.setProperty('--flow-fill', t.toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!fTick) { fTick = true; requestAnimationFrame(drawSpine); } }, { passive: true });
      drawSpine();
    }
  }

  /* Product showcase.
     Desktop: click a step in the list to show its panel.
     Phones and tablets: all seven cards show, stacked down the page. */
  var sbtns = document.querySelectorAll('.show-btn'), panels = document.querySelectorAll('.show-panel');
  var narrow = window.matchMedia('(max-width: 899px)');
  var sel = 0;
  function pick(i) {
    sel = i;
    sbtns.forEach(function (x, k) { x.setAttribute('aria-selected', String(k === i)); });
    if (!narrow.matches) panels.forEach(function (p, k) { p.hidden = k !== i; });
  }
  sbtns.forEach(function (b) { b.addEventListener('click', function () { pick(+b.dataset.p); }); });
  function mode() {
    if (narrow.matches) panels.forEach(function (p) { p.hidden = false; });
    else pick(sel);
  }
  if (narrow.addEventListener) narrow.addEventListener('change', mode); else narrow.addListener(mode);
  mode();

  /* The old way: the three pain cards rise into place as they scroll into
     view. Each card gets --p, 0 when its top edge is near the bottom of the
     screen and 1 once it has travelled about a third of the screen. Scrolling
     back up plays it in reverse. Side by side (640px and wider) each card
     starts a little after the one before it, so they arrive as a staircase.
     The position is read from the layout, not from the moving card, so the
     animation cannot feed back into its own measurement. */
  var painBox = $('pains');
  if (painBox && !still) {
    var pains = painBox.querySelectorAll('.pcard'), pTick = false;
    var liftPains = function () {
      pTick = false;
      var vh = window.innerHeight, boxTop = painBox.getBoundingClientRect().top;
      if (boxTop > vh * 1.2 || boxTop + painBox.offsetHeight < -vh) return;
      var lag = window.innerWidth >= 640 ? 0.08 : 0;
      pains.forEach(function (card, i) {
        var top = boxTop + card.offsetTop;
        var t = Math.min(1, Math.max(0, (vh * (0.97 - i * lag) - top) / (vh * 0.34)));
        card.style.setProperty('--p', (1 - (1 - t) * (1 - t)).toFixed(3));
      });
    };
    var onPains = function () { if (!pTick) { pTick = true; requestAnimationFrame(liftPains); } };
    window.addEventListener('scroll', onPains, { passive: true });
    window.addEventListener('resize', onPains);
    pains.forEach(function (card) { card.style.setProperty('--p', '0'); });
    liftPains();
  }

  /* Walkthrough videos: the page shows only a cover picture and a play button.
     YouTube is loaded when the visitor taps play, so nobody spends mobile data
     on a video they did not ask for. Without this script the same element is
     a normal link that opens the video on YouTube. */
  document.querySelectorAll('.video.yt[data-yt]').forEach(function (v) {
    v.addEventListener('click', function (e) {
      e.preventDefault();
      if (v.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + v.dataset.yt + '?autoplay=1&rel=0&playsinline=1';
      f.title = v.dataset.title || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      v.appendChild(f);
      v.removeAttribute('href');
    });
  });

  /* Appearance: the dashboard fades from Light to Night Dim as the section is
     scrolled, the same effect as the live site. It stays Light while the
     picture comes into view, changes as the middle of the picture travels
     from three quarters of the way down the screen to a little above the
     centre, and is fully Night Dim while the whole picture is still on screen. */
  var dimStage = $('dimStage');
  if (dimStage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var dTick = false;
    var mixDim = function () {
      dTick = false;
      var r = dimStage.getBoundingClientRect(), vh = window.innerHeight;
      var mid = r.top + r.height / 2;
      var mix = Math.min(1, Math.max(0, (vh * 0.75 - mid) / (vh * 0.33)));
      dimStage.style.setProperty('--dim-mix', mix.toFixed(3));
    };
    var onDim = function () { if (!dTick) { dTick = true; requestAnimationFrame(mixDim); } };
    window.addEventListener('scroll', onDim, { passive: true });
    window.addEventListener('resize', onDim);
    mixDim();
  }

})();
