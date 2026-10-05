// In-memory stand-in for a Supabase project (Auth + PostgREST), used by the
// tests through Playwright request routing. It mirrors supabase/schema.sql:
// rows are scoped to the signed-in user (row-level security), a profile is
// created on sign-up, and free accounts are limited to 50 reflections.
import { randomUUID } from "node:crypto";

const b64 = obj => Buffer.from(JSON.stringify(obj)).toString("base64url");

export function createMockSupabase({ url = "https://testproject.supabase.co", anonKey = "sb_publishable_test_0123456789abcdef", autoConfirm = true } = {}) {
  const users = new Map();      // id -> user
  const tokens = new Map();     // access token -> user id
  const refresh = new Map();    // refresh token -> user id
  const tables = { profiles: [], reflections: [], saved_verses: [], journey_entries: [], month_notes: [] };
  const log = [];
  const state = { autoConfirm };

  const publicUser = u => ({
    id: u.id, aud: "authenticated", role: "authenticated", email: u.email,
    email_confirmed_at: u.confirmed ? u.created_at : null, created_at: u.created_at, updated_at: u.created_at,
    user_metadata: u.user_metadata, app_metadata: { provider: "email", providers: ["email"] }, identities: []
  });

  function issueSession(userId) {
    const now = Math.floor(Date.now() / 1000);
    const access = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: userId, role: "authenticated", aud: "authenticated", exp: now + 3600, iat: now, session_id: randomUUID() })}.sig`;
    const rt = randomUUID();
    tokens.set(access, userId);
    refresh.set(rt, userId);
    return { access_token: access, token_type: "bearer", expires_in: 3600, expires_at: now + 3600, refresh_token: rt, user: publicUser(users.get(userId)) };
  }

  function createUser({ email, password, data = {}, confirmed }) {
    const u = { id: randomUUID(), email, password, user_metadata: data, created_at: new Date().toISOString(), confirmed };
    users.set(u.id, u);
    tables.profiles.push({ id: u.id, name: String(data.name || "").slice(0, 80), plan: "free", journey_finished_at: null, created_at: u.created_at });
    return u;
  }

  const findByEmail = email => [...users.values()].find(u => u.email === email);
  const ownerKey = table => (table === "profiles" ? "id" : "user_id");
  const json = (status, body) => ({ status, contentType: "application/json", body: body === undefined ? "" : JSON.stringify(body) });
  const authError = (status, code, msg) => json(status, { code: status, error_code: code, msg });

  function currentUserId(headers) {
    const token = (headers.authorization || "").replace(/^Bearer\s+/i, "");
    return tokens.get(token) || null;
  }

  function parseFilters(params) {
    const filters = [];
    for (const [k, v] of params) {
      if (["select", "order", "on_conflict", "columns", "limit"].includes(k)) continue;
      const m = v.match(/^eq\.(.*)$/);
      if (m) filters.push([k, m[1]]);
    }
    return filters;
  }
  const matches = (row, filters) => filters.every(([k, v]) => String(row[k]) === v);

  function handleAuth(method, path, params, headers, body) {
    if (path === "/signup" && method === "POST") {
      if (findByEmail(body.email)) return authError(422, "user_already_exists", "User already registered");
      if (state.emailFails) return authError(500, "unexpected_failure", "Error sending confirmation email");
      if (String(body.password || "").length < 6) return authError(422, "weak_password", "Password should be at least 6 characters.");
      const u = createUser({ email: body.email, password: body.password, data: body.data, confirmed: state.autoConfirm });
      log.push({ type: "signup", email: body.email, redirectTo: params.get("redirect_to") });
      return json(200, state.autoConfirm ? issueSession(u.id) : publicUser(u));
    }
    if (path === "/token" && method === "POST") {
      const grant = params.get("grant_type");
      if (grant === "password") {
        const u = findByEmail(body.email);
        if (!u || u.password !== body.password) return authError(400, "invalid_credentials", "Invalid login credentials");
        if (!u.confirmed) return authError(400, "email_not_confirmed", "Email not confirmed");
        return json(200, issueSession(u.id));
      }
      if (grant === "refresh_token") {
        const id = refresh.get(body.refresh_token);
        if (!id || !users.has(id)) return authError(400, "refresh_token_not_found", "Invalid Refresh Token");
        return json(200, issueSession(id));
      }
    }
    if (path === "/user") {
      const id = currentUserId(headers);
      if (!id || !users.has(id)) return authError(401, "bad_jwt", "invalid JWT");
      const u = users.get(id);
      if (method === "PUT") {
        if (body.password) {
          if (body.password === u.password) return authError(422, "same_password", "New password should be different from the old password.");
          u.password = body.password;
          log.push({ type: "password_updated", email: u.email });
        }
        if (body.data) u.user_metadata = { ...u.user_metadata, ...body.data };
      }
      return json(200, publicUser(u));
    }
    if (path === "/logout") return { status: 204, body: "" };
    if (path === "/recover" && method === "POST") {
      log.push({ type: "recover", email: body.email, redirectTo: params.get("redirect_to") });
      return json(200, {});
    }
    return authError(404, "not_found", `mock: unhandled auth ${method} ${path}`);
  }

  function handleRest(method, path, params, headers, body) {
    const uid = currentUserId(headers);
    if (path === "/rpc/delete_account") {
      if (!uid) return json(401, { message: "permission denied for function delete_account" });
      users.delete(uid);
      for (const t of Object.keys(tables)) tables[t] = tables[t].filter(r => r[ownerKey(t)] !== uid);
      log.push({ type: "delete_account" });
      return { status: 204, body: "" };
    }
    const table = path.slice(1);
    if (!tables[table]) return json(404, { message: `relation "${table}" does not exist` });
    if (!uid) return json(401, { code: "42501", message: `permission denied for table ${table}` });
    const owner = ownerKey(table);
    const mine = () => tables[table].filter(r => r[owner] === uid);
    const filters = parseFilters(params);

    if (method === "GET") {
      let rows = mine().filter(r => matches(r, filters));
      const order = params.get("order");
      if (order) {
        const [col, dir] = order.split(".");
        rows = [...rows].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (dir === "desc" ? -1 : 1));
      }
      if ((headers.accept || "").includes("vnd.pgrst.object")) {
        if (rows.length !== 1) return json(406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" });
        return json(200, rows[0]);
      }
      return json(200, rows);
    }

    if (method === "POST") {
      if (table === "profiles") return json(403, { code: "42501", message: "permission denied for table profiles" });
      const prefer = headers.prefer || "";
      const conflict = (params.get("on_conflict") || (table === "reflections" ? "id" : "")).split(",").filter(Boolean);
      for (const raw of [].concat(body)) {
        const row = { ...raw, user_id: raw.user_id ?? uid };
        if (row.user_id !== uid) return json(403, { code: "42501", message: `new row violates row-level security policy for table "${table}"` });
        const existing = conflict.length ? tables[table].find(r => conflict.every(c => String(r[c]) === String(row[c]))) : null;
        if (existing) {
          if (existing[owner] !== uid) return json(403, { code: "42501", message: "row-level security" });
          if (prefer.includes("ignore-duplicates")) continue;
          if (!prefer.includes("merge-duplicates")) return json(409, { code: "23505", message: "duplicate key value violates unique constraint" });
          Object.assign(existing, row);
          continue;
        }
        if (table === "reflections") {
          const plan = tables.profiles.find(p => p.id === uid)?.plan;
          if (plan !== "premium" && mine().length >= 50) return json(400, { code: "P0001", message: "free_limit_reached" });
          row.id = row.id || randomUUID();
          row.created_at = row.created_at || new Date().toISOString();
        }
        if (table === "journey_entries" && row.reflection_id && !tables.reflections.some(r => r.id === row.reflection_id)) {
          return json(409, { code: "23503", message: "insert or update on table \"journey_entries\" violates foreign key constraint" });
        }
        tables[table].push(row);
      }
      return { status: 201, body: "" };
    }

    if (method === "PATCH") {
      if (table === "profiles" && Object.keys(body).some(k => !["name", "journey_finished_at"].includes(k))) {
        return json(403, { code: "42501", message: "permission denied for table profiles" });
      }
      mine().filter(r => matches(r, filters)).forEach(r => Object.assign(r, body));
      return { status: 204, body: "" };
    }

    if (method === "DELETE") {
      const doomed = new Set(mine().filter(r => matches(r, filters)));
      tables[table] = tables[table].filter(r => !doomed.has(r));
      if (table === "reflections") tables.journey_entries.forEach(j => { if ([...doomed].some(d => d.id === j.reflection_id)) j.reflection_id = null; });
      return { status: 204, body: "" };
    }
    return json(405, { message: "method not allowed" });
  }

  async function route(r) {
    const req = r.request();
    const u = new URL(req.url());
    const headers = req.headers();
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors() });
    if (headers.apikey !== anonKey) return r.fulfill({ ...json(401, { message: "Invalid API key" }), headers: cors() });
    // Like Supabase's gateway: a non-JWT (publishable) key may appear as a Bearer token only if it equals the apikey header.
    const bearer = (headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (bearer && !bearer.includes(".") && bearer !== headers.apikey) {
      return r.fulfill({ ...json(401, { message: "Invalid Authorization header" }), headers: cors() });
    }
    let body = {};
    try { body = req.postData() ? JSON.parse(req.postData()) : {}; } catch { body = {}; }
    const res = u.pathname.startsWith("/auth/v1")
      ? handleAuth(req.method(), u.pathname.slice("/auth/v1".length), u.searchParams, headers, body)
      : handleRest(req.method(), u.pathname.slice("/rest/v1".length), u.searchParams, headers, body);
    return r.fulfill({ ...res, headers: cors() });
  }

  const cors = () => ({ "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" });

  return {
    url, anonKey, tables, log, state, users,
    route,
    pattern: new RegExp(`^${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`),
    issueSessionFor(email) { return issueSession(findByEmail(email).id); },
    userByEmail: findByEmail,
    profileFor(email) { const u = findByEmail(email); return u && tables.profiles.find(p => p.id === u.id); },
    rowsFor(table, email) { const u = findByEmail(email); return u ? tables[table].filter(r => r[ownerKey(table)] === u.id) : []; }
  };
}

// Serve config.js with Supabase switched on.
export async function enableSupabaseConfig(context, mock) {
  await context.route(/\/assets\/js\/config\.js(\?.*)?$/, async r => {
    const res = await r.fetch();
    const src = (await res.text())
      .replace(/(supabase:\s*\{\s*url:\s*)"[^"]*"/, `$1"${mock.url}"`)
      .replace(/anonKey:\s*"[^"]*"/, `anonKey: "${mock.anonKey}"`);
    await r.fulfill({ response: res, body: src, headers: { ...res.headers(), "content-type": "text/javascript" } });
  });
  await context.route(mock.pattern, r => mock.route(r));
}
