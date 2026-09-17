/* ══════════════════════════════════════════════════════════════════════════
   payments.js, the checkout path on the pricing section.

   WHAT THIS DOES
   Two things, and nothing else:
     1. Drives the Monthly / Yearly toggle above the plan cards.
     2. Points each plan button at the right destination for the plan +
        cycle the visitor has selected.

   WHY IT IS A HOSTED LINK AND NOT A CARD FORM
   Card numbers never touch this site. Every checkout button is an ordinary
   <a href> to the payment provider's own hosted checkout page, which is what
   keeps this site out of PCI scope entirely. There is no card field here to
   leak, no card data in this JS, and no secret key in the bundle. The only
   thing this file holds is a public checkout URL, which is safe to publish
   (it is the same URL you would paste into a Messenger reply).

   ══ HOW THIS IS WIRED ════════════════════════════════════════════════════
   Only the YEARLY slots hold a checkout URL. PayMongo payment links are
   one-time only, so a yearly link is a single charge that covers 12 months
   and the button reads "Pay for 1 year".

   MONTHLY is intentionally not self-serve. Its slots are left empty, so the
   monthly button routes to the contact form at #cta and reads "Contact us".
   When PayMongo Subscriptions (real recurring billing) is integrated later,
   fill the monthly slots and revisit the button text in apply().

   See PAYMENT-SETUP.md for the dashboard steps.
   ══════════════════════════════════════════════════════════════════════════ */

const PAYMENT_LINKS = {
  starter: {
    monthly: '',   // not self-serve, see "HOW THIS IS WIRED" above
    yearly:  'https://pm.link/org-iivtzN68pxjrV8aSPDpwYBYN/NYAnOqk',
  },
  growth: {
    monthly: '',
    yearly:  'https://pm.link/org-iivtzN68pxjrV8aSPDpwYBYN/zUMhAWk',
  },
};

/* Enterprise is deliberately absent. It is quoted per operator, so it must
   stay a conversation, never a self-serve checkout at a guessed price. */

// ───────────────────────────────────────────────────────────────────────────

(function () {
  const toggle = document.getElementById('billingToggle');
  const grid   = document.querySelector('.price-grid');
  if (!grid) return;

  const buttons = Array.from(grid.querySelectorAll('[data-plan]'));

  /* One pass over the cards. Called on load and on every toggle flip.

     The price text is NOT recomputed here, both figures are already in the
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

    // Point each plan button at the matching destination.
    buttons.forEach((btn) => {
      const url = (PAYMENT_LINKS[btn.dataset.plan] || {})[cycle] || '';

      if (url) {
        btn.href = url;
        btn.textContent = cycle === 'yearly' ? 'Pay for 1 year' : 'Subscribe';
        btn.removeAttribute('data-unconfigured');
        /* rel is set here rather than in the HTML because the fallback below
           is a same-page anchor, where noopener/noreferrer are meaningless. */
        btn.rel = 'noopener';
      } else {
        /* No self-serve checkout for this cycle (monthly). Send them to the
           contact form to arrange billing, not a button that goes nowhere. */
        btn.href = '#cta';
        btn.textContent = 'Contact us';
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
