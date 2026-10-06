// Site-wide settings. Edit these before launch.
export const CONFIG = {
  siteName: "Gita Reflection",
  // The public address shown on share cards and in shared links.
  siteUrl: "https://gita-reflection.vercel.app",
  tagline: "A calm place to pause, reflect, and find perspective through the wisdom of the Bhagavad Gita.",

  // Accounts & saved reflections. Leave empty to keep accounts in each visitor's
  // browser only. Fill both in to use Supabase (see SUPABASE.md). The anon key is
  // public by design — your data is protected by the row-level security in supabase/schema.sql.
  supabase: {
    url: "https://hcdatxuimvmubdbxifty.supabase.co",
    anonKey: "sb_publishable_FK1orC_pELoPag95_fbT3A_L3qEdkU5"
  },

  // Shown on the Contact page. Leave empty to hide the email address.
  contactEmail: "",

  // Free plan limits
  freeSavedLimit: 50,

  // Payments. Premium uses Razorpay Subscriptions through the Supabase functions
  // in supabase/functions (keys live in Supabase secrets, never here):
  //   razorpay: ""     → Premium buttons show "Coming soon"
  //   razorpay: "test" → checkout only for people who opened #/premium?paytest=1
  //                      and whose email is in RAZORPAY_TEST_EMAILS
  //   razorpay: "live" → checkout for everyone
  // Product links (e.g. Razorpay Payment Pages) — while empty, buttons show "Coming soon".
  payments: {
    razorpay: "test",
    premiumMonthly: "",
    premiumYearly: "",
    products: {
      "journal-7": "",
      "journal-30": "",
      "bundle": "",
      "inner-peace-30": "",
      "daily-cards": "",
      "journaling-pack": ""
    }
  },

  pricing: {
    monthly: 49,
    yearly: 499
  },

  // Optional: full 700-verse dataset used only when someone looks up a verse
  // that is not in the curated library. Loaded lazily; the site works without it.
  fullDatasetUrl: "https://chiragmirani.github.io/gita-quotes/data.json",

  // Crisis support (India). Shown whenever someone may be in danger.
  crisis: {
    name: "Tele-MANAS",
    phone: "14416",
    altPhone: "1800-89-14416",
    emergency: "112"
  }
};

export const PRODUCTS = [
  { id: "journal-7", title: "7-Day Gita Reflection Journal", price: 99, format: "Printable PDF", desc: "A gentle week of guided prompts, one verse a day, with space to write by hand." },
  { id: "journal-30", title: "30-Day Gita Reflection Journal", price: 199, format: "Printable PDF", desc: "A month of verses, reflection questions and small practices, organised by theme." },
  { id: "bundle", title: "Gita Reflection Bundle", price: 299, format: "Both journals + cards", desc: "The 7-day and 30-day journals together with a set of printable daily reflection cards." },
  { id: "inner-peace-30", title: "30-Day Inner Peace Journey", price: 399, format: "Guided program + PDF", desc: "A deeper month-long journey through the Gita's teachings on the mind, rest and letting go." },
  { id: "daily-cards", title: "Daily Reflection Cards", price: 149, format: "Printable PDF", desc: "One verse and one question per card — for a desk, a mirror, or a quiet morning." },
  { id: "journaling-pack", title: "Gita-Inspired Journaling Pack", price: 249, format: "Printable PDF templates", desc: "Monthly review pages, gratitude spreads and decision worksheets inspired by the Gita." }
];
