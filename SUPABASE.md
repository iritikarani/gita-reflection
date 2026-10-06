# Connecting Supabase

With Supabase connected, accounts work on every device, saved reflections are kept in a real database, and "Forgot password" sends an email link. Without it, the site still works, with accounts stored in each visitor's browser.

It takes about 10 minutes and is free to start.

## 1. Create a project
1. Sign in at [supabase.com](https://supabase.com) → **New project**.
2. Choose a name (e.g. `gita-reflection`), set a database password (keep it safe; the website doesn't need it), and pick the region closest to your visitors (e.g. **Mumbai** for India).

## 2. Create the tables
1. In your project: **SQL Editor** → **New query**.
2. Paste the whole contents of [`supabase/schema.sql`](supabase/schema.sql) and press **Run**.

This creates the tables, the security rules (each person can only ever see their own reflections) and the free-plan limit. It's safe to run again.

## 3. Set up sign-in emails
**Authentication → URL Configuration**
- **Site URL**: your website's address, e.g. `https://gita-reflection.vercel.app/`.
- **Redirect URLs**: add the same address. For local testing, also add `http://localhost:8080/`.

**Authentication → Sign In / Providers → Email**
- Keep **Email** enabled.
- **Confirm email**: recommended **on**. New users get a confirmation link, and anything they were saving is kept until they click it.
- Minimum password length: 8 (matches the website).

Supabase's built-in email sender is only meant for testing and sends very few emails per hour. Before launch, add your own email provider (e.g. Resend, Brevo, Amazon SES) under **Project Settings → Authentication → SMTP Settings**. You can also make the email wording gentler under **Authentication → Emails**.

## 4. Paste two values into the website
**Project Settings → API** (or **Connect**). Copy:
- **Project URL**, e.g. `https://abcdefgh.supabase.co`
- **anon public** key (labelled "publishable" in newer projects)

Put them in [`assets/js/config.js`](assets/js/config.js):

```js
supabase: {
  url: "https://abcdefgh.supabase.co",
  anonKey: "eyJhbGciOi..."
},
```

The anon/publishable key is designed to be public. **Never** put the `service_role` / secret key in the website.

## 5. Check it
Open the site, create an account, save a reflection, then look in **Table Editor → reflections**: your row should be there. Log in on another device and the reflection appears there too.

## 6. Payments with Razorpay (Premium)

Premium is a Razorpay **subscription** (₹49/month or ₹499/year). Two small
Supabase functions do the secure work. They create the subscription, check
that the payment really came from Razorpay, and switch the account to Premium
and back. Your Razorpay Key Secret lives only in Supabase. It is never in the
website or this repository.

Do everything first with **Test Mode** keys. No real money moves.

**a. Run the latest `supabase/schema.sql`** (SQL Editor → paste → Run). It
adds the subscription columns and a private payment log.

**b. In Razorpay (Test Mode), create two plans.** Go to Subscriptions → Plans
→ Create Plan:
- Monthly: ₹49, every 1 month
- Yearly: ₹499, every 1 year

Copy both Plan IDs (`plan_…`).

**c. Deploy the two functions.** In Supabase, go to Edge Functions → Deploy a
new function → Via Editor, and do this twice:

| Function name      | Paste the contents of                          | "Verify JWT" / "Enforce JWT verification" |
|--------------------|------------------------------------------------|--------------------------------------------|
| `razorpay`         | `supabase/functions/razorpay/index.ts`         | **Off** (the function checks the login itself) |
| `razorpay-webhook` | `supabase/functions/razorpay-webhook/index.ts` | **Off** (Razorpay signs its own requests) |

(With the Supabase CLI instead: `supabase functions deploy razorpay --no-verify-jwt`
and `supabase functions deploy razorpay-webhook --no-verify-jwt`.)

**d. Add the webhook in Razorpay.** Go to Account & Settings → Webhooks →
Add New Webhook:
- URL: `https://<your-project>.supabase.co/functions/v1/razorpay-webhook`
- Secret: make up a long random password and note it down
- Active events: `subscription.activated`, `subscription.charged`,
  `subscription.pending`, `subscription.halted`, `subscription.cancelled`,
  `subscription.completed`, `subscription.paused`, `subscription.resumed`

**e. Add the secrets in Supabase.** Go to Edge Functions → Secrets (or
Project Settings → Edge Functions) and add:

| Name                       | Value                                                        |
|----------------------------|--------------------------------------------------------------|
| `RAZORPAY_KEY_ID`          | `rzp_test_…` (later `rzp_live_…`)                            |
| `RAZORPAY_KEY_SECRET`      | the Key Secret shown when you generated the key              |
| `RAZORPAY_PLAN_MONTHLY`    | the monthly `plan_…` ID                                      |
| `RAZORPAY_PLAN_YEARLY`     | the yearly `plan_…` ID                                       |
| `RAZORPAY_WEBHOOK_SECRET`  | the webhook secret from step d                               |
| `RAZORPAY_TEST_EMAILS`     | your own email(s), comma-separated. Only these can use test checkout |

If a function later reports that it can't reach the database, also add
`SERVICE_ROLE_KEY` with your project's secret key (Project Settings → API
Keys → `sb_secret_…`). Supabase normally provides this automatically.

**f. Try it.** Sign in to the site with an email from `RAZORPAY_TEST_EMAILS`
and open `https://gita-reflection.vercel.app/#/premium?paytest=1`. That turns
on test checkout in that browser only; `?paytest=0` turns it off. Pay with
Razorpay's test card or test UPI ID (shown in Razorpay's docs). The account
should become Premium within seconds. Profile shows the renewal date and a
"Cancel subscription" button.

**g. Go live** after Razorpay approves your account:
1. Switch Razorpay to Live Mode, then generate live keys.
2. Create the same two plans again in Live Mode.
3. Add the webhook again in Live Mode, with the same URL and a new secret.
4. In Supabase secrets, replace the four `RAZORPAY_…` values with the live
   ones.
5. In `assets/js/config.js`, set `payments.razorpay` to `"live"`.

Until step 5, everyone else still sees "Coming soon".

## Good to know
- **Giving someone Premium** (until payments are connected): run in the SQL Editor
  `update public.profiles set plan = 'premium' where id = (select id from auth.users where email = 'person@example.com');`
  People can't change their own plan from the browser.
- **Free plan limit** is 50 reflections, enforced in the database. If you change `freeSavedLimit` in `config.js`, change the `50` in `supabase/schema.sql` and run it again.
- **Deleting an account** from the Profile page permanently removes the person and all their data.
- **Existing browser-only accounts** aren't moved automatically. People who signed up before you connected Supabase can download their data from Profile first, then create a new account.
- **Developers:** `npm run test:supabase` runs the Supabase flows against a local mock of the API. `scripts/vendor-supabase.sh` updates the bundled Supabase client.
