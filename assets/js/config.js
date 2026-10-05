// Site-wide settings. Edit these before launch.
export const CONFIG = {
  siteName: "Gita Reflection",
  tagline: "A calm place to pause, reflect, and find perspective through the wisdom of the Bhagavad Gita.",

  // Shown on the Contact page. Leave empty to hide the email address.
  contactEmail: "",

  // Free plan limits
  freeSavedLimit: 50,

  // Payment links (e.g. Razorpay Payment Pages or Stripe Payment Links).
  // While empty, purchase buttons show "Coming soon" instead of a checkout.
  payments: {
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
    monthly: 149,
    yearly: 1199
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
