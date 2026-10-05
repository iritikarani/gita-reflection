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

## Good to know
- **Giving someone Premium** (until payments are connected): run in the SQL Editor
  `update public.profiles set plan = 'premium' where id = (select id from auth.users where email = 'person@example.com');`
  People can't change their own plan from the browser.
- **Free plan limit** is 50 reflections, enforced in the database. If you change `freeSavedLimit` in `config.js`, change the `50` in `supabase/schema.sql` and run it again.
- **Deleting an account** from the Profile page permanently removes the person and all their data.
- **Existing browser-only accounts** aren't moved automatically. People who signed up before you connected Supabase can download their data from Profile first, then create a new account.
- **Developers:** `npm run test:supabase` runs the Supabase flows against a local mock of the API. `scripts/vendor-supabase.sh` updates the bundled Supabase client.
