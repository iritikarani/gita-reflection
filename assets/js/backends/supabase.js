// Supabase provider: real accounts (email + password, email confirmation,
// password reset by email) and reflections stored in Postgres, protected by
// row-level security. See supabase/schema.sql and SUPABASE.md.
//
// Loads a slim, vendored build of Supabase's official auth + database clients
// (assets/vendor/supabase-slim.mjs) only when Supabase is configured.

const FRIENDLY = [
  [/invalid login credentials|invalid_credentials/i, "That email and password don't match an account."],
  [/email not confirmed/i, "Please confirm your email first — we sent a link to your inbox."],
  [/already registered|already exists|user_already_exists/i, "An account with this email already exists. Try logging in instead."],
  [/error sending (confirmation|recovery|magic link|invite)? ?e?mail|unexpected_failure.*mail|smtp/i, "We couldn't send the email just now. Please try again in a few minutes."],
  [/rate limit|too many|over_email_send_rate_limit|429/i, "Too many attempts. Please wait a minute and try again."],
  [/password should be|weak_password|password.*(characters|length)/i, "Please choose a stronger password (at least 8 characters)."],
  [/same.*password|same_password/i, "Please choose a password different from your current one."],
  [/failed to fetch|network|load failed/i, "We couldn't reach the server. Please check your connection."]
];

function friendly(error) {
  const msg = String(error?.message || error || "");
  for (const [re, text] of FRIENDLY) if (re.test(msg) || re.test(error?.code || "")) return new Error(text);
  return new Error(msg || "Something went wrong. Please try again.");
}

const ts = v => (v ? new Date(v).getTime() : null);
const iso = v => (v ? new Date(v).toISOString() : null);

function rowToReflection(r) {
  return {
    id: r.id, createdAt: ts(r.created_at), updatedAt: ts(r.updated_at),
    source: r.source, said: r.said, emotion: r.emotion, group: r.theme_group,
    verseId: r.verse_id, question: r.question, text: r.body || ""
  };
}

function reflectionToRow(r, userId) {
  return {
    id: r.id, user_id: userId, created_at: iso(r.createdAt), updated_at: iso(r.updatedAt),
    source: r.source || null, said: r.said || null, emotion: r.emotion || null, theme_group: r.group || null,
    verse_id: r.verseId || null, question: r.question || null, body: r.text || ""
  };
}

export function preload() { return import("../../vendor/supabase-slim.mjs"); }

export async function createSupabaseBackend({ url, anonKey }, { onAuthEvent } = {}) {
  const { AuthClient, PostgrestClient } = await import("../../vendor/supabase-slim.mjs");
  const base = url.replace(/\/$/, "");
  const host = new URL(base).hostname.split(".")[0];

  const auth = new AuthClient({
    url: `${base}/auth/v1`,
    headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
    storageKey: `sb-${host}-auth-token`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "implicit"
  });

  // Same approach as supabase-js: every database request carries the signed-in user's token.
  const authedFetch = async (input, init = {}) => {
    const { data } = await auth.getSession();
    const headers = new Headers(init.headers);
    headers.set("apikey", anonKey);
    if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${data.session?.access_token || anonKey}`);
    return fetch(input, { ...init, headers });
  };
  const db = new PostgrestClient(`${base}/rest/v1`, { fetch: authedFetch });

  let me = null;
  let busy = 0; // > 0 while signUp/logIn run, so their own SIGNED_IN event doesn't reload data twice
  const redirectTo = () => location.href.split("#")[0];

  async function check(promise) {
    const { data, error } = await promise;
    if (error) throw friendly(error);
    return data;
  }

  async function loadUser(sessionUser) {
    const id = sessionUser.id;
    const [profile, reflections, saved, journey, notes, programRows, collectionRows] = await Promise.all([
      check(db.from("profiles").select("*").eq("id", id).maybeSingle()), // "*" so older schemas without subscription columns still load
      check(db.from("reflections").select("*").order("created_at", { ascending: false })),
      check(db.from("saved_verses").select("verse_id, created_at").order("created_at", { ascending: false })),
      check(db.from("journey_entries").select("*")),
      check(db.from("month_notes").select("month, body")),
      // Premium tables: tolerate their absence if schema.sql hasn't been re-run yet.
      db.from("program_entries").select("*").then(r => r.data || []),
      db.from("collections").select("*").order("created_at", { ascending: false }).then(r => r.data || [])
    ]);
    const programs = {};
    for (const row of programRows) {
      const p = programs[row.program] ||= { completed: [], entries: {} };
      p.entries[row.day] = { text: row.body || "", done: row.done, updatedAt: ts(row.updated_at) };
      if (row.done) p.completed.push(row.day);
    }
    me = {
      id, email: sessionUser.email,
      name: profile?.name || sessionUser.user_metadata?.name || sessionUser.email.split("@")[0],
      plan: profile?.plan || "free",
      subscription: profile?.subscription_status ? { status: profile.subscription_status, period: profile.subscription_period, renewsAt: ts(profile.renews_at) } : null,
      createdAt: ts(profile?.created_at || sessionUser.created_at)
    };
    const entries = {};
    const completed = [];
    for (const j of journey) {
      entries[j.day] = { text: j.body || "", done: j.done, reflectionId: j.reflection_id, updatedAt: ts(j.updated_at) };
      if (j.done) completed.push(j.day);
    }
    return {
      user: me,
      data: {
        reflections: reflections.map(rowToReflection),
        savedVerses: saved.map(s => s.verse_id),
        journey: { completed: completed.sort((a, b) => a - b), entries, finishedAt: ts(profile?.journey_finished_at) },
        monthNotes: Object.fromEntries(notes.map(n => [n.month, n.body || ""])),
        programs,
        collections: collectionRows.map(c => ({ id: c.id, name: c.name, verseIds: c.verse_ids || [], createdAt: ts(c.created_at) }))
      }
    };
  }

  // Auth events from other tabs, email links and token expiry.
  // (Never await Supabase calls inside this callback — defer them instead.)
  auth.onAuthStateChange((event, session) => {
    setTimeout(async () => {
      if (event === "SIGNED_OUT") { me = null; onAuthEvent?.({ event, user: null, data: null }); return; }
      if (event === "SIGNED_IN" && busy) return;
      if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session?.user && (!me || me.id !== session.user.id || event === "PASSWORD_RECOVERY")) {
        try { onAuthEvent?.({ event, ...(await loadUser(session.user)) }); }
        catch (e) { console.error(e); }
      }
    }, 0);
  });

  const userId = () => {
    if (!me) throw new Error("Please log in again.");
    return me.id;
  };

  return {
    mode: "supabase",

    async init() {
      const { data } = await auth.getSession(); // waits for any email-link session in the URL
      if (!data.session) return { user: null, data: null };
      try { return await loadUser(data.session.user); }
      catch (e) { console.error(e); return { user: null, data: null, error: e }; }
    },

    async signUp({ name, email, password }) {
      busy++;
      try {
        const data = await check(auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: redirectTo() } }));
        if (!data.session) return { user: null, data: null, needsConfirmation: true };
        return await loadUser(data.user);
      } finally { busy--; }
    },

    async logIn({ email, password }) {
      busy++;
      try {
        const data = await check(auth.signInWithPassword({ email, password }));
        return await loadUser(data.user);
      } finally { busy--; }
    },

    async logOut() {
      me = null;
      await auth.signOut({ scope: "local" });
    },

    async requestPasswordReset(email) {
      await check(auth.resetPasswordForEmail(email, { redirectTo: redirectTo() }));
    },

    async updatePassword(password) {
      await check(auth.updateUser({ password }));
    },

    async updateName(name) {
      await check(db.from("profiles").update({ name }).eq("id", userId()));
      await auth.updateUser({ data: { name } }).catch(() => {});
      me = { ...me, name };
      return me;
    },

    async setPlan() { throw new Error("Plans are managed on the server."); },

    // Calls a Supabase Edge Function (e.g. "razorpay") as the signed-in user.
    async callFunction(name, body) {
      const { data } = await auth.getSession();
      if (!data.session) throw Object.assign(new Error("Please log in again."), { code: "not_signed_in" });
      let res;
      try {
        res = await fetch(`${base}/functions/v1/${name}`, {
          method: "POST",
          headers: { apikey: anonKey, Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } catch { throw Object.assign(new Error("network"), { code: "network" }); }
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(out.error || `http_${res.status}`), { code: out.error || `http_${res.status}` });
      return out;
    },

    async refresh() {
      const { data } = await auth.getSession();
      return data.session ? loadUser(data.session.user) : { user: null, data: null };
    },

    async deleteAccount() {
      // Stop any subscription first, so no one is charged after their account is gone.
      if (["created", "authenticated", "active", "pending", "cancelling"].includes(me?.subscription?.status)) {
        try { await this.callFunction("razorpay", { action: "cancel", immediately: true }); }
        catch { throw new Error("We couldn't cancel your subscription just now, so your account wasn't deleted. Please try again in a moment."); }
      }
      await check(db.rpc("delete_account"));
      me = null;
      await auth.signOut({ scope: "local" }).catch(() => {});
    },

    // ---- writes ----
    async putReflection(r) {
      await check(db.from("reflections").upsert(reflectionToRow(r, userId())));
    },
    async removeReflection(id) {
      await check(db.from("reflections").delete().eq("id", id));
    },
    async setSavedVerse(verseId, saved) {
      if (saved) await check(db.from("saved_verses").upsert({ user_id: userId(), verse_id: verseId }, { onConflict: "user_id,verse_id", ignoreDuplicates: true }));
      else await check(db.from("saved_verses").delete().eq("verse_id", verseId));
    },
    async putJourneyEntry(day, entry) {
      await check(db.from("journey_entries").upsert({
        user_id: userId(), day, body: entry.text || "", done: Boolean(entry.done),
        reflection_id: entry.reflectionId || null, updated_at: new Date().toISOString()
      }, { onConflict: "user_id,day" }));
    },
    async clearJourney() {
      await check(db.from("journey_entries").delete().eq("user_id", userId()));
      await check(db.from("profiles").update({ journey_finished_at: null }).eq("id", userId()));
    },
    async setJourneyFinished(when) {
      await check(db.from("profiles").update({ journey_finished_at: iso(when) }).eq("id", userId()));
    },
    async putProgramEntry(programId, day, entry) {
      await check(db.from("program_entries").upsert({
        user_id: userId(), program: programId, day, body: entry.text || "", done: Boolean(entry.done), updated_at: new Date().toISOString()
      }, { onConflict: "user_id,program,day" }));
    },
    async putCollection(col) {
      await check(db.from("collections").upsert({ id: col.id, user_id: userId(), name: col.name, verse_ids: col.verseIds, created_at: iso(col.createdAt) }));
    },
    async removeCollection(id) {
      await check(db.from("collections").delete().eq("id", id));
    },
    async putMonthNote(month, text) {
      await check(db.from("month_notes").upsert({ user_id: userId(), month, body: text, updated_at: new Date().toISOString() }, { onConflict: "user_id,month" }));
    }
  };
}
