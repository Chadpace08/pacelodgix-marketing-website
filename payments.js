/* ══════════════════════════════════════════════════════════════════════════
   payments.js — the Subscribe path on the pricing section.

   WHAT THIS DOES
   Two things, and nothing else:
     1. Drives the Monthly / Yearly toggle above the plan cards.
     2. Points each "Subscribe" button at the right hosted checkout link
        for the plan + cycle the visitor has selected.

   WHY IT IS A HOSTED LINK AND NOT A CARD FORM
   Card numbers never touch this site. Every Subscribe button is an ordinary
   <a href> to the payment provider's own hosted checkout page, which is what
   keeps this site out of PCI scope entirely — there is no card field here to
   leak, no card data in this JS, and no secret key in the bundle. The only
   thing this file holds is a public checkout URL, which is safe to publish
   (it is the same URL you would paste into a Messenger reply).

   ══ CONFIGURE ME ══════════════════════════════════════════════════════════
   Paste your four hosted-checkout URLs below. Until a slot is filled, its
   Subscribe button silently falls back to the demo form at #cta and relabels
   itself — so deploying this file BEFORE you have the links is safe and the
   page never shows a dead button.

   Recommended provider: PayMongo (Philippine, settles to a PH bank, and its
   checkout accepts GCash, Maya, GrabPay and cards). Any provider works —
   this file only needs the finished URL. See PAYMENT-SETUP.md for the
   click-by-click steps.
   ══════════════════════════════════════════════════════════════════════════ */

const PAYMENT_LINKS = {
  starter: {
    monthly: '',   // e.g. 'https://pm.link/pacelodgix/starter-monthly'
    yearly:  '',   // e.g. 'https://pm.link/pacelodgix/starter-yearly'
  },
  growth: {
    monthly: '',
    yearly:  '',
  },
};

/* Enterprise is deliberately absent. It is quoted per operator, so it must
   stay a conversation — never a self-serve checkout at a guessed price. */

// ───────────────────────────────────────────────────────────────────────────

(function () {
  const toggle = document.getElementById('billingToggle');
  const grid   = document.querySelector('.price-grid');
  if (!grid) return;

  const buttons = Array.from(grid.querySelectorAll('[data-plan]'));

  /* One pass over the cards. Called on load and on every toggle flip.

     The price text is NOT recomputed here — both figures are already in the
     HTML as data attributes, so the page renders correct prices with this
     script blocked or still loading, and a toggle flip is a text swap rather
     than a currency-formatting exercise that could drift from the JSON-LD. */
  function apply(cycle) {
    // Prices + the "/mo" vs "/yr" suffix.
    grid.querySelectorAll('.pc-amt[data-monthly]').forEach((el) => {
      const amount = el.dataset[cycle];
      if (!amount) return;                       // Enterprise ("Custom") has none.
      el.querySelector('.pc-figure').textContent = amount;
      el.querySelector('.pc-period').textContent = cycle === 'yearly' ? '/yr' : '/mo';
    });

    // The per-card saving line, shown only on the yearly view.
    grid.querySelectorAll('.pc-save').forEach((el) => {
      el.hidden = cycle !== 'yearly';
    });

    // Point each Subscribe button at the matching checkout URL.
    buttons.forEach((btn) => {
      const url = (PAYMENT_LINKS[btn.dataset.plan] || {})[cycle] || '';

      if (url) {
        btn.href = url;
        btn.textContent = 'Subscribe';
        btn.removeAttribute('data-unconfigured');
        /* rel is set here rather than in the HTML because the fallback below
           is a same-page anchor, where noopener/noreferrer are meaningless. */
        btn.rel = 'noopener';
      } else {
        /* No link configured yet. Send them down the path that definitely
           works — the demo form — instead of a button that goes nowhere. */
        btn.href = '#cta';
        btn.textContent = 'Start Free Today';
        btn.setAttribute('data-unconfigured', '');
        btn.removeAttribute('rel');
      }
    });

    // Tell the payment-methods strip whether checkout is live yet.
    const strip = document.getElementById('payMethods');
    if (strip) {
      strip.hidden = !buttons.some((b) => !b.hasAttribute('data-unconfigured'));
    }
  }

  function currentCycle() {
    return toggle && toggle.querySelector('[aria-pressed="true"]')?.dataset.cycle === 'yearly'
      ? 'yearly'
      : 'monthly';
  }

  if (toggle) {
    /* aria-pressed, not a checkbox: these are two buttons acting as one
       either/or control, and a screen reader announces the pressed state
       without needing a visible label change. */
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cycle]');
      if (!btn) return;
      toggle.querySelectorAll('[data-cycle]').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      apply(btn.dataset.cycle);
    });
  }

  apply(currentCycle());
})();
