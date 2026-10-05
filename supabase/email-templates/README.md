# Account emails (English + हिन्दी)

Supabase sends one version of each email to everyone, so each template carries both languages: English first, then Hindi.

**How to use:** Supabase → **Authentication → Emails** (Email Templates). For each type below, paste the subject and the whole contents of the HTML file into the message body, then **Save**.

| Supabase template | Subject | File |
|---|---|---|
| Confirm signup | `Confirm your email · अपना ईमेल पुष्ट करें — Gita Reflection` | `confirm-signup.html` |
| Reset password | `Choose a new password · नया पासवर्ड चुनें — Gita Reflection` | `reset-password.html` |
| Change email address | `Confirm your new email · नया ईमेल पुष्ट करें — Gita Reflection` | `change-email.html` |
| Magic link | `Your sign-in link · लॉग इन लिंक — Gita Reflection` | `magic-link.html` |

The `{{ .ConfirmationURL }}` placeholder is filled in by Supabase. The site doesn't use magic links today; that template is there so every email looks the same if you turn them on.
