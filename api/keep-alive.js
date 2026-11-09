// Keeps the Supabase project awake. Supabase's free plan pauses a project after
// about a week without activity; Vercel runs this once a day (see "crons" in
// vercel.json) and it makes one tiny database call. It reads nothing private
// and uses only the public key that is already in the website.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://hcdatxuimvmubdbxifty.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_FK1orC_pELoPag95_fbT3A_L3qEdkU5";

async function ping() {
  const headers = { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
  // keep_alive() (supabase/schema.sql) just returns the time. If the schema
  // hasn't been re-run yet, a one-row read of the profiles table
  // still reaches the database (it returns nothing to the public key).
  let res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/keep_alive`, { method: "POST", headers, body: "{}" });
  if (res.status === 404) res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, { headers });
  return { status: res.status, ok: res.status < 500 };
}

export default async function handler(req, res) {
  try {
    const result = await ping();
    res.status(result.ok ? 200 : 502).json({ ...result, at: new Date().toISOString() });
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e?.message || e) });
  }
}
