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

  /* Interactive hero: tap a screen, or let it rotate every 5 seconds */
  var data = [
    { d: 'assets/shots/app/dashboard.webp', m: 'assets/shots/phone/m-dashboard.webp', ic: '▲', t: 'This month ₱184,250', s: '▲ 18% vs. last' },
    { d: 'assets/shots/app/calendar.webp', m: 'assets/shots/phone/m-calendar.webp', ic: '✓', t: 'March', s: '4 units · 82% booked' },
    { d: 'assets/shots/app/bookings.webp', m: 'assets/shots/phone/m-bookings.webp', ic: 'MR', t: 'Maria Reyes · ₱12,400', s: 'Villa Anilao · 3 nights · Confirmed' },
    { d: 'assets/shots/app/booking-form.webp', m: 'assets/shots/phone/m-book.webp', ic: '★', t: 'Booked direct', s: 'No platform commission' },
    { d: 'assets/shots/app/ledger.webp', m: 'assets/shots/phone/m-ledger.webp', ic: '₱', t: 'Payment recorded', s: 'GCash · proof attached' }
  ];
  data.forEach(function (x) { new Image().src = x.d; new Image().src = x.m; });
  var stage = $('stage'), tabs = stage.querySelectorAll('.htab');
  var desk = $('hDesk'), phone = $('hPhone');
  var cur = 0, timer = null;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dots = $('hDots').children;
  function show(i) {
    cur = i;
    tabs.forEach(function (x, k) { x.setAttribute('aria-selected', String(k === i)); });
    for (var k = 0; k < dots.length; k++) dots[k].className = k === i ? 'on' : '';
    $('hName').textContent = tabs[i].textContent;
    var d = data[i];
    [desk, phone].forEach(function (img) { img.classList.add('out'); });
    setTimeout(function () {
      desk.src = d.d; phone.src = d.m;
      $('hIc').textContent = d.ic; $('hT').textContent = d.t; $('hS').textContent = d.s;
      [desk, phone].forEach(function (img) { img.classList.remove('out'); });
    }, 180);
  }
  function stop() { clearInterval(timer); timer = null; stage.classList.remove('auto'); }
  tabs.forEach(function (b) { b.addEventListener('click', function () { stop(); show(+b.dataset.i); }); });
  function step(d) { stop(); show((cur + d + data.length) % data.length); }
  $('hPrev').addEventListener('click', function () { step(-1); });
  $('hNext').addEventListener('click', function () { step(1); });
  /* Swipe left or right on the screens to move between them */
  var sx = null, sy = null, screens = stage.querySelector('.screens');
  screens.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  screens.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    sx = null;
  }, { passive: true });
  dots[0].className = 'on';
  if (still) { stage.classList.remove('auto'); }
  else {
    timer = setInterval(function () {
      show((cur + 1) % data.length);
      stage.classList.remove('auto'); void stage.offsetWidth; stage.classList.add('auto');
    }, 5000);
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
     Phones and tablets: the section pins, and scrolling down slides the pages
     sideways, pausing on each one so it can be read. */
  var sbtns = document.querySelectorAll('.show-btn'), panels = document.querySelectorAll('.show-panel');
  var show = $('show'), track = $('showTrack'), sticky = show.querySelector('.show-sticky');
  var narrow = window.matchMedia('(max-width: 899px)');
  var labels = Array.prototype.map.call(panels, function (p) { return p.querySelector('.label').textContent; });
  var sel = 0, sTick = false;
  function pick(i) {
    sel = i;
    sbtns.forEach(function (x, k) { x.setAttribute('aria-selected', String(k === i)); });
    if (!narrow.matches) panels.forEach(function (p, k) { p.hidden = k !== i; });
  }
  sbtns.forEach(function (b) { b.addEventListener('click', function () { pick(+b.dataset.p); }); });
  function slide() {
    sTick = false;
    if (!narrow.matches) return;
    var n = panels.length;
    var start = show.getBoundingClientRect().top - parseFloat(getComputedStyle(sticky).top);
    var range = show.offsetHeight - sticky.offsetHeight;
    var p = Math.min(1, Math.max(0, -start / range));
    var f = p * (n - 1), i = Math.floor(f), frac = f - i;
    /* hold on each page for the first and last quarter of its stretch */
    var ease = Math.min(1, Math.max(0, (frac - 0.25) / 0.5));
    ease = ease * ease * (3 - 2 * ease);
    var pos = Math.min(n - 1, i + ease);
    var w = track.clientWidth + 16;
    track.style.transform = 'translate3d(' + (-pos * w).toFixed(1) + 'px,0,0)';
    var now = Math.round(pos);
    $('showName').textContent = labels[now];
    $('showBar').style.width = (p * 100).toFixed(1) + '%';
    if (now !== sel) pick(now);
  }
  function onShowScroll() { if (!sTick) { sTick = true; requestAnimationFrame(slide); } }
  function mode() {
    if (narrow.matches) { panels.forEach(function (p) { p.hidden = false; }); slide(); }
    else { track.style.transform = ''; pick(sel); }
  }
  window.addEventListener('scroll', onShowScroll, { passive: true });
  window.addEventListener('resize', onShowScroll);
  if (narrow.addEventListener) narrow.addEventListener('change', mode); else narrow.addListener(mode);
  mode();

  /* Appearance: Light / Night Dim */
  var seg = document.querySelectorAll('.seg button'), dimImg = $('dimImg');
  seg.forEach(function (b) {
    b.addEventListener('click', function () {
      seg.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      dimImg.src = b.dataset.src; dimImg.alt = 'Dashboard in ' + b.textContent;
    });
  });

})();
