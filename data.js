import { createClient } from "@supabase/supabase-js";

// Server-side, read-only, no session. Public content is readable by RLS policy.
function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) },
  });
}

export async function getSettings() {
  try {
    const { data } = await db().from("site_settings").select("key,value");
    return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

export async function getList(table, opts = {}) {
  try {
    let q = db().from(table).select("*");
    q = opts.newestFirst
      ? q.order("sort_order", { ascending: false }).order("created_at", { ascending: false })
      : q.order("sort_order").order("created_at");
    const { data } = await q;
    return data || [];
  } catch {
    return [];
  }
}
