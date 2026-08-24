# How to turn on the Subscribe buttons

**Right now the payment section is built but switched off.** Every "Subscribe"
button still says *Start Free Today* and goes to the demo form, and the
GCash/Maya row is hidden. That is on purpose — a button that takes money before
you can deliver an account is worse than no button. Nothing breaks if you deploy
today and finish this later.

To switch it on you need to do two things: create four payment links, and paste
them into one file.

---

## Before you start — good news

**A person who pays can sign up and get straight in.** I checked this against
your live database rather than trusting the notes.

When someone signs up at app.pacelodgix.com and types their business name, the
database creates their business, makes them the owner, and fills in the default
settings automatically. So this works today:

> they pay → they sign up → they are in

Some of your project notes still say signup leaves people locked out. **That was
true once and is not true now** — it was fixed by migration 031. Ignore that note.

What is still manual is **connecting the payment to the account**. Nothing tells
your app that a person has paid, so you have to keep track yourself for now:

1. PayMongo emails you when someone pays.
2. Check they signed up.
3. Keep a simple list — who paid, which plan, when it renews.

That is fine at your size. When you have more customers than you can track in a
list, that is the moment to connect payments to the app automatically, not before.

If someone pays but cannot sign up for some reason, see *If a signup goes wrong*
at the bottom.

---

## Step 1 — Choose the payment company

**My recommendation: PayMongo.**

Here is why, plainly:

| | Why it fits you |
|---|---|
| **PayMongo** ← use this | Philippine company. Money lands in your Philippine bank account in pesos. Your customers can pay with **GCash**, which is how most Filipinos actually pay. You can make payment links by clicking, with no code. |
| Xendit | Also Philippine and also good, but built for bigger companies. More setup, more paperwork. |
| Stripe | **Cannot be used.** Stripe does not let businesses in the Philippines accept payments. Do not spend a day on this one. |
| Paddle / Lemon Squeezy | Only worth it if you start selling mostly to customers outside the Philippines. They charge higher fees and price in dollars. |

**Fees:** PayMongo charges roughly 2.5% + ₱15 on GCash and about 3.5% + ₱15 on
cards, at the time of writing. On a ₱999 plan that is about ₱40. Check their
current pricing page before you promise anything to a customer.

**What you need to sign up:** your DTI business registration, a valid ID, and
your bank account details. Approval usually takes a few business days.

---

## Step 2 — Create four payment links

You need **four**, because you sell two plans and two billing cycles.

In the PayMongo dashboard, go to **Links** (or **Payment Links**) and click
**Create**. Do this four times:

| # | Name it | Amount | Set it to repeat |
|---|---|---|---|
| 1 | Pace Lodgix Starter — Monthly | ₱399 | Every month |
| 2 | Pace Lodgix Starter — Yearly | ₱3,990 | Every year |
| 3 | Pace Lodgix Growth — Monthly | ₱999 | Every month |
| 4 | Pace Lodgix Growth — Yearly | ₱9,990 | Every year |

For each link, make sure:

1. **Turn on the payment methods you want** — GCash, Maya, GrabPay, Visa,
   Mastercard, online bank transfer. The website says you accept all six, so
   tick all six or change the website text to match.
2. **Ask for the customer's name and email.** This is the only way you will know
   who paid. Do not skip it.
3. **Copy the finished link.** It looks something like
   `https://pm.link/pacelodgix/starter-monthly`.

> **If PayMongo does not offer automatic repeating charges on your account
> level:** make plain one-off links instead, and change the website wording from
> "Subscribe" to "Pay for 12 months" for the yearly ones. Do not let the page
> say a payment repeats automatically if it does not. That is the kind of thing
> that turns into a chargeback.

---

## Step 3 — Paste the four links into the website

1. Open the file **`payments.js`** in this folder.
2. Near the top you will see this block:

```js
const PAYMENT_LINKS = {
  starter: {
    monthly: '',
    yearly:  '',
  },
  growth: {
    monthly: '',
    yearly:  '',
  },
};
```

3. Paste each link between the quote marks that matches it. Keep the quote marks
   and keep the comma at the end. It should end up looking like this:

```js
const PAYMENT_LINKS = {
  starter: {
    monthly: 'https://pm.link/pacelodgix/starter-monthly',
    yearly:  'https://pm.link/pacelodgix/starter-yearly',
  },
  growth: {
    monthly: 'https://pm.link/pacelodgix/growth-monthly',
    yearly:  'https://pm.link/pacelodgix/growth-yearly',
  },
};
```

4. Save the file.

**Nothing else in the code needs to change.** The buttons rewire themselves.

---

## Step 4 — Check it before you publish

Open `index.html` in your browser (just double-click it) and scroll to Pricing.
You should see:

- A **Monthly / Yearly** switch above the three plan cards, with a green
  "2 months free" badge on Yearly.
- Clicking **Yearly** changes ₱399 to ₱3,990 and ₱999 to ₱9,990, the "/mo"
  becomes "/yr", and a green "You save ₱798 a year" line appears.
- The two buttons now say **Subscribe** instead of *Start Free Today*.
- A row of grey chips appears: GCash, Maya, GrabPay, Visa, Mastercard, Online
  bank transfer.
- Clicking **Subscribe** on Growth while Yearly is selected opens the ₱9,990
  PayMongo page — **check the amount on that page is right before you publish.**

If the buttons still say *Start Free Today*, one of the links did not get pasted
in properly. Check you did not delete a quote mark.

---

## Step 5 — Publish

```
npx wrangler deploy
```

This is the live public site, so only run it when Step 4 looked right.

---

## If a signup goes wrong

If someone paid but has no working account, you can create their business by
hand:

1. In Supabase, go to **Authentication → Users** and copy their user id.
2. Go to the **SQL Editor** and run this, with their real details:

```sql
select provision_tenant_for_user(
  'PASTE-THEIR-USER-ID-HERE',
  'Their Business Name'
);
```

3. Email them to confirm they are in.

Running it twice is harmless — it will not create a second business or wipe
anything they have already changed.

---

## One thing to fix on the legal side

`privacy.html` now says a payment provider handles your customers' card details,
but it does not name the company yet, because you have not chosen it. Once you
sign up with PayMongo, change "Our payment provider" in **Section 8** to
"**PayMongo**" and add a link to their privacy policy. It takes two minutes and
the Data Privacy Act expects processors to be named.
